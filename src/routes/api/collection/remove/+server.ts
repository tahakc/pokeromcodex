import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { romId } = await request.json();
    
    if (!romId) {
      return json({ success: false, error: 'ROM ID is required' }, { status: 400 });
    }
    
    // Get all user IDs associated with this account (from linked accounts)
    const userIds = locals.allUserIds || [locals.user.id];
    console.log(`Checking collection for ROM ${romId} across all linked accounts:`, userIds);
    
    // Find the item in any of the linked collections
    const { data: existingItems, error: checkError } = await locals.supabase
      .from('collections')
      .select('id, user_id')
      .in('user_id', userIds)
      .eq('rom_id', romId);

    if (checkError) { 
      console.error('Error checking collection:', checkError);
      return json({ success: false, error: 'Failed to check collection status' }, { status: 400 });
    }

    // If item doesn't exist in any linked account, return success without attempting to remove
    if (!existingItems || existingItems.length === 0) {
      console.log(`ROM ${romId} not in collection for any linked user of ${locals.user.id}, nothing to remove`);
      return json({ 
        success: true, 
        alreadyRemoved: true,
        message: 'ROM was not in collection' 
      });
    }

    // Process each found item (there might be multiple if the ROM is in collections of multiple linked accounts)
    const results = await Promise.all(existingItems.map(async (item) => {
      // Remove the item from each linked collection
      const { error } = await locals.supabase
        .from('collections')
        .delete()
        .eq('id', item.id);
      
      if (error) {
        console.error(`Error removing ROM from collection for user ${item.user_id}:`, error);
        return { success: false, userId: item.user_id, error };
      }
      
      console.log(`ROM ${romId} removed from collection for user ${item.user_id}`);
      return { success: true, userId: item.user_id };
    }));
    
    // Check if all operations were successful
    const allSuccessful = results.every(result => result.success);
    
    if (allSuccessful) {
      return json({ 
        success: true,
        message: 'ROM removed from all linked collections',
        details: results
      });
    } else {
      return json({ 
        success: false,
        error: 'Failed to remove ROM from some collections',
        details: results
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error removing ROM from collection:', error);
    return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
};