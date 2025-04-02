import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, '/auth');
  }

  // Get all user IDs associated with this account (from linked accounts)
  const userIds = locals.allUserIds || [locals.user.id];

  // Fetch collection for all linked accounts, just like in the collection page
  const { data: collection, error: collectionError } = await locals.supabase
    .from('collections')
    .select(`
      *,
      rom:romslist(*)
    `)
    .in('user_id', userIds)
    .order('added_at', { ascending: false });

  // No need to log errors as they will already appear in server logs
  
  // Create a set of collection ROM IDs for faster lookups, just like in collection page
  const collectionRomIds = new Set(collection ? collection.map((item: any) => item.rom_id) : []);

  const { count: collectionCount, error: countError } = await locals.supabase
    .from('collections')
    .select('id', { count: 'exact' })
    .in('user_id', userIds);

  // Errors will be present in server logs

  // Transform the collection data for easier consumption in the UI, just like in collection page
  const collectionItems = collection ? collection.map((item: any) => ({
    ...item.rom,
    isInCollection: true,
    collectionId: item.id,
    addedAt: item.added_at,
    // Add a flag to indicate if this ROM was added by a linked account
    addedByLinkedAccount: item.user_id !== locals.user?.id
  })) : [];

  return {
    collection: collectionItems,
    collectionCount: collectionCount || 0,
    user: locals.user,
    identities: [],
    collectionIds: Array.from(collectionRomIds)
  };
}; 