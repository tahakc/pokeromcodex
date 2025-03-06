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

    // First check if the item is already in the collection for any linked account
    const { data: existingItems, error: checkError } = await locals.supabase
      .from('collections')
      .select('id, user_id')
      .in('user_id', userIds)
      .eq('rom_id', romId);

    if (checkError) {
      console.error('Error checking collection:', checkError);
      return json({ success: false, error: 'Failed to check collection status' }, { status: 400 });
    }

    // If item already exists in any linked account, return success without attempting to add again
    if (existingItems && existingItems.length > 0) {
      const existingUserId = existingItems[0].user_id;
      console.log(`ROM ${romId} already in collection for user ${existingUserId} (linked to ${locals.user.id})`);
      return json({ 
        success: true, 
        alreadyExists: true,
        message: 'ROM already in collection',
        linkedAccount: existingUserId !== locals.user.id
      });
    }

    // Add the item to the collection under the current user ID
    const { error } = await locals.supabase
      .from('collections')
      .insert({
        user_id: locals.user.id,
        rom_id: romId
      });

    if (error) {
      console.error('Error adding ROM to collection:', error);
      return json({ success: false, error: 'Failed to add ROM to collection' }, { status: 400 });
    }

    console.log(`ROM ${romId} added to collection for user ${locals.user.id}`);
    return json({ 
      success: true,
      message: 'ROM added to collection'
    });
  } catch (error) {
    console.error('Error adding ROM to collection:', error);
    return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
};