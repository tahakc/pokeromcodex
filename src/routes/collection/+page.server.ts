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
  // I need to actually find a better way to do this
  // I know views do not exist, but I put it just in case we add it later
  const collectionRomIds = collection ? collection.map(item => item.rom_id) : [];
  
  const { data: recommendations, error: recommendationsError } = await locals.supabase
    .from('romslist')
    .select('*')
    .not('id', 'in', collectionRomIds.length > 0 ? `(${collectionRomIds.join(',')})` : '(0)')
    .order('views', { ascending: false })
    .limit(6);

  if (recommendationsError) {
    console.error('Error fetching recommendations:', recommendationsError);
  }

  return {
    collection: collection || [],
    recommendations: recommendations || []
  };
}; 