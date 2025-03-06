import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, '/auth');
  }

  const { data: collection, error: collectionError } = await locals.supabase
    .from('collections')
    .select(`
      *,
      rom:romslist(*)
    `)
    .eq('user_id', locals.user.id)
    .order('added_at', { ascending: false });

  if (collectionError) {
    console.error('Error fetching user collection:', collectionError);
  }

  const { count: collectionCount, error: countError } = await locals.supabase
    .from('collections')
    .select('id', { count: 'exact' })
    .eq('user_id', locals.user.id);

  if (countError) {
    console.error('Error fetching user collection count:', countError);
  }

  return {
    collection: collection || [],
    collectionCount: collectionCount || 0
  };
}; 