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

    const { error } = await locals.supabase
      .from('collections')
      .insert({
        user_id: locals.user.id,
        rom_id: romId
      });

    if (error) {
      if (error.code === '23505') {
        return json({ success: false, error: 'This ROM is already in your collection' }, { status: 400 });
      }
      console.error('Error adding ROM to collection:', error);
      return json({ success: false, error: 'Failed to add ROM to collection' }, { status: 400 });
    }

    return json({ success: true });
  } catch (error) {
    console.error('Error adding ROM to collection:', error);
    return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}; 