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
      .delete()
      .eq('user_id', locals.user.id)
      .eq('rom_id', romId);

    if (error) {
      console.error('Error removing ROM from collection:', error);
      return json({ success: false, error: 'Failed to remove ROM from collection' }, { status: 400 });
    }

    return json({ success: true });
  } catch (error) {
    console.error('Error removing ROM from collection:', error);
    return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}; 