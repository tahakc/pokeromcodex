import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, '/auth');
  }

  // Get all user IDs associated with this account (from linked accounts)
  const userIds = locals.allUserIds || [locals.user.id];
  console.log(`Fetching collection for all linked accounts:`, userIds);

  // Fetch collection for all linked accounts
  const { data: collection, error: collectionError } = await locals.supabase
    .from('collections')
    .select(`
      *,
      rom:romslist(*)
    `)
    .in('user_id', userIds)
    .order('added_at', { ascending: false });

  if (collectionError) {
    console.error('Error fetching user collection:', collectionError);
  }
  
  // Create a set of collection ROM IDs for faster lookups
  const collectionRomIds = new Set(collection ? collection.map((item: any) => item.rom_id) : []);
  
  // Transform the collection data for easier consumption in the UI
  const collectionItems = collection ? collection.map((item: any) => ({
    ...item.rom,
    isInCollection: true,
    collectionId: item.id,
    addedAt: item.added_at,
    // Add a flag to indicate if this ROM was added by a linked account
    addedByLinkedAccount: item.user_id !== locals.user?.id
  })) : [];
  
  console.log(`User has ${collectionRomIds.size} ROMs in collection across ${userIds.length} linked accounts`);
  
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
  const recommendationsWithCollectionState = recommendations ? recommendations.map((rom: any) => ({
    ...rom,
    isInCollection: collectionRomIds.has(rom.id)
  })) : [];

  return {
    collection: collectionItems,
    recommendations: recommendationsWithCollectionState,
    collectionIds: Array.from(collectionRomIds)
  };
};