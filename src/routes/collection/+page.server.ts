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
  
  // Create a set of collection ROM IDs for faster lookups
  const collectionRomIds = new Set(collection ? collection.map(item => item.rom_id) : []);
  
  // Transform the collection data for easier consumption in the UI
  const collectionItems = collection ? collection.map(item => ({
    ...item.rom,
    isInCollection: true,
    collectionId: item.id,
    addedAt: item.added_at
  })) : [];
  
  console.log(`User has ${collectionRomIds.size} ROMs in collection`);
  
  const { data: recommendations, error: recommendationsError } = await locals.supabase
    .from('romslist')
    .select('*')
    .not('id', 'in', collectionRomIds.size > 0 ? `(${Array.from(collectionRomIds).join(',')})` : '(0)')
    .order('views', { ascending: false })
    .limit(6);

  if (recommendationsError) {
    console.error('Error fetching recommendations:', recommendationsError);
  }

  // Add isInCollection property to recommendations
  const recommendationsWithCollectionState = recommendations ? recommendations.map(rom => ({
    ...rom,
    isInCollection: collectionRomIds.has(rom.id)
  })) : [];

  return {
    collection: collectionItems,
    recommendations: recommendationsWithCollectionState,
    collectionIds: Array.from(collectionRomIds)
  };
};