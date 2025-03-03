import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { error, redirect } from '@sveltejs/kit'
import { isBrowser } from '$lib/utils'
import type { LayoutLoad } from './$types'
import { collectionStore } from '$lib/stores/collection'

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
  depends('supabase:auth')
  const supabase = isBrowser()
    ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { global: { fetch } })
    : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { global: { fetch }, cookies: { getAll() { return data.cookies } } })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If we have a user session, get their collection and initialize the store
  if (session?.user) {
    try {
      // Get user's collection
      const { data: collectionData } = await supabase
        .from('collections')
        .select('rom_id')
        .eq('user_id', session.user.id);
      
      if (collectionData) {
        // Extract the ROM IDs
        const collectionIds = collectionData.map(item => item.rom_id);
        // Initialize the collection store
        collectionStore.initialize(collectionIds);
        console.log(`[DEBUG] Initialized collection store with ${collectionIds.length} ROMs`);
      }
    } catch (err) {
      console.error('Error fetching collection data:', err);
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return {
    supabase,
    user,
    ...data,
  }
}