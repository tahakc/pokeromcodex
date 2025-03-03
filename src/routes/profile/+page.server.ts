import { redirect, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
  const { session } = await safeGetSession()
  
  if (!session) {
    redirect(303, '/auth/signin')
  }
  
  // We still fetch the first identity for GitHub username display
  const { data, error } = await supabase.auth.getUserIdentities()
  
  if (error) {
    console.error('Error fetching user identities:', error)
    return { identities: [] }
  }
  
  return {
    identities: data?.identities || []
  }
}

export const actions: Actions = {
  signout: async ({ locals: { supabase } }) => {
    await supabase.auth.signOut()
    redirect(303, '/')
  }
} 