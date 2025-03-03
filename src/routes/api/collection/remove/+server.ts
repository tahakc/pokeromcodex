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
    
    // First check if the item is in the collection
    const { data: existingItem, error: checkError } = await locals.supabase
      .from('collections')
      .select('id')
      .eq('user_id', locals.user.id)
      .eq('rom_id', romId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { 
      console.error('Error checking collection:', checkError);
      return json({ success: false, error: 'Failed to check collection status' }, { status: 400 });
    }

    // If item doesn't exist, return success without attempting to remove
    if (!existingItem) {
      console.log(`ROM ${romId} not in collection for user ${locals.user.id}, nothing to remove`);
      return json({ 
        success: true, 
        alreadyRemoved: true,
        message: 'ROM was not in collection' 
      });
    }

    // Item exists, so remove it
    const { error } = await locals.supabase
      .from('collections')
      .delete()
      .eq('user_id', locals.user.id)
      .eq('rom_id', romId);

    if (error) {
      console.error('Error removing ROM from collection:', error);
      return json({ success: false, error: 'Failed to remove ROM from collection' }, { status: 400 });
    }

    console.log(`ROM ${romId} removed from collection for user ${locals.user.id}`);
    return json({ 
      success: true,
      message: 'ROM removed from collection'
    });
  } catch (error) {
    console.error('Error removing ROM from collection:', error);
    return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
};