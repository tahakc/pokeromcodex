import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {

  if (!locals.user) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {

    // Parse the request JSON
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('JSON parse error:', e);
      return json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    // Extract romId and ensure it's a number
    const romId = typeof body.romId === 'number' ? body.romId : Number(body.romId);

    if (isNaN(romId) || !romId) {
      console.error('Invalid ROM ID received:', body.romId, 'Type:', typeof body.romId);
      return json({ success: false, error: 'ROM ID is required and must be a valid number' }, { status: 400 });
    }

    // Use the main user ID (must be valid UUID format)
    const userId = locals.user?.id; // Safely access user ID

    // Verify it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (userId && !uuidRegex.test(userId)) {
      console.error('Add endpoint: User ID is not in UUID format:', userId);
      return json({ success: false, error: 'User ID must be in UUID format' }, { status: 400 });
    }

    if (!userId) {
      return json({ success: false, error: 'User ID required but not available' }, { status: 400 });
    }

    // Try a simpler approach: just insert the record directly without checking first


    try {
      // Add the item to the collection under the current user ID
      const { data: insertData, error: insertError } = await locals.supabase
        .from('collections')
        .insert({
          user_id: userId,
          rom_id: romId
        })
        .select('id');



      if (insertError) {
        // Check if it's a duplicate error (23505)
        if (insertError.code === '23505') {

          return json({
            success: true,
            alreadyExists: true,
            message: 'ROM already in collection'
          });
        } else {
          console.error('Failed to add to collection:', insertError);
          return json({ success: false, error: 'Failed to add to collection' }, { status: 500 });
        }
      }

      return json({
        success: true,
        message: 'Added to collection',
        id: insertData?.[0]?.id
      });
    } catch (e) {
      console.error('Exception during add operation:', e);
      return json({ success: false, error: 'Exception during add operation' }, { status: 500 });
    }


  } catch (error) {
    return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
};
