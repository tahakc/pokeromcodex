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

    // First check if the item is already in the collection
    const { data: existingItem, error: checkError } = await locals.supabase
      .from('collections')
      .select('id')
      .eq('user_id', locals.user.id)
      .eq('rom_id', romId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error checking collection:', checkError);
      return json({ success: false, error: 'Failed to check collection status' }, { status: 400 });
    }

    // If item already exists, return success without attempting to add again
    if (existingItem) {
      console.log(`ROM ${romId} already in collection for user ${locals.user.id}`);
      return json({ 
        success: true, 
        alreadyExists: true,
        message: 'ROM already in collection' 
      });
    }

    // Add the item to the collection
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