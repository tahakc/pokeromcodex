import { redirect, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { PUBLIC_SITE_URL } from '$env/static/public'

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
  const { session, user } = await safeGetSession()
  
  if (!session) {
    redirect(303, '/auth')
  }
  
  // Fetch user identities for GitHub username display
  const { data: identitiesData, error: identitiesError } = await supabase.auth.getUserIdentities()
  
  if (identitiesError) {
    console.error('Error fetching user identities:', identitiesError)
    return { identities: [] }
  }
  
  // Fetch linked accounts from the database
  const { data: linkedAccounts, error: linkedError } = await supabase
    .from('user_identity_map')
    .select('id, primary_user_id, linked_user_id, provider, created_at')
    .or(`primary_user_id.eq.${user?.id},linked_user_id.eq.${user?.id}`)
  
  if (linkedError) {
    console.error('Error fetching linked accounts:', linkedError)
    return {
      identities: identitiesData?.identities || [],
      linkedAccounts: []
    }
  }
  
  // Process linked accounts to get a list of providers
  const processedAccounts: Array<{
    id: string;
    userId: string;
    provider: string;
    createdAt: string;
  }> = []
  
  if (linkedAccounts && linkedAccounts.length > 0) {
    for (const account of linkedAccounts) {
      // Add the account with its provider
      processedAccounts.push({
        id: account.id,
        userId: account.linked_user_id === user?.id ? account.primary_user_id : account.linked_user_id,
        provider: account.provider,
        createdAt: account.created_at
      })
    }
  }
  
  console.log('Processed linked accounts:', processedAccounts)
  
  return {
    identities: identitiesData?.identities || [],
    linkedAccounts: processedAccounts
  }
}

export const actions: Actions = {
  signout: async ({ locals: { supabase }, cookies }) => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      return fail(500, { error: 'Failed to sign out' })
    }
    
    // Clear any session cookies
    cookies.delete('sb-auth-token', { path: '/' })
    cookies.delete('sb-refresh-token', { path: '/' })
    
    // Redirect to the home page
    return redirect(303, '/')
  },
  
  linkAccount: async ({ request, locals: { supabase, user } }) => {
    if (!user) {
      return fail(401, { error: 'You must be logged in to link accounts' })
    }
    
    const formData = await request.formData()
    const provider = formData.get('provider')?.toString()
    
    if (!provider || !['github', 'discord'].includes(provider)) {
      return fail(400, { error: 'Invalid provider' })
    }
    
    // Check if the user is already using this provider
    if (user.app_metadata?.provider === provider) {
      return fail(400, { error: `You are already using ${provider} to log in` })
    }
    
    // Check if this provider is already linked to the account
    try {
      const { data: existingLinks, error: checkError } = await supabase
        .from('user_identity_map')
        .select('id')
        .eq('primary_user_id', user.id)
        .eq('provider', provider)
      
      if (checkError) {
        console.warn('Error checking for existing links, but continuing:', checkError)
        // Continue despite error - this handles the case when migration hasn't been run yet
      } else if (existingLinks && existingLinks.length > 0) {
        return fail(400, { error: `Your account is already linked to ${provider}` })
      }
    } catch (err) {
      console.warn('Exception checking existing links, but continuing:', err)
      // Continue despite error
    }
    
    try {
      // Initiate OAuth flow with link_action parameter to indicate we're linking accounts
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as 'github' | 'discord',
        options: {
          redirectTo: `${PUBLIC_SITE_URL}/auth/callback?link_action=true`,
          queryParams: {
            // Add any additional query parameters needed for the OAuth provider
          }
        }
      })
      
      if (error) {
        console.error('Error initiating OAuth flow for account linking:', error)
        return fail(500, { error: error.message })
      }
      
      // Redirect to the OAuth provider's authorization page
      redirect(303, data.url)
    } catch (error) {
      console.error('Exception in linkAccount action:', error)
      return fail(500, { error: 'An unexpected error occurred' })
    }
  }
}