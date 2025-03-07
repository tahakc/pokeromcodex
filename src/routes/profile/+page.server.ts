import { redirect, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { PUBLIC_SITE_URL } from '$env/static/public'
import type { Provider } from '@supabase/supabase-js'

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
  const { session, user } = await safeGetSession()

  if (!session) {
    redirect(303, '/auth')
  }

  // Fetch user identities for GitHub username display
  const { data: identitiesData, error: identitiesError } = await supabase.auth.getUserIdentities()

  if (identitiesError) {
    return { identities: [] }
  }

  return {
    identities: identitiesData?.identities || []
  }
}

export const actions: Actions = {
  // Get OAuth URL for a provider without redirecting
  getOAuthUrl: async ({ request, locals: { supabase, user } }) => {
    console.log('getOAuthUrl called with user:', user?.id)
    
    if (!user) {
      console.log('No user found, returning error')
      return { success: false, error: 'You must be logged in to get OAuth URL' }
    }

    const formData = await request.formData()
    const provider = formData.get('provider')?.toString()
    console.log('Provider from form data:', provider)

    if (!provider || !['github', 'discord'].includes(provider)) {
      console.log('Invalid provider:', provider)
      return { success: false, error: 'Invalid provider' }
    }

    try {
      console.log('Generating OAuth URL for provider:', provider)
      
      // Generate the OAuth URL
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options: {
          redirectTo: `${PUBLIC_SITE_URL}profile?linked=true&provider=${provider}`,
          scopes: provider === 'discord' ? 'identify email' : 'user:email'
        }
      })
      
      console.log('OAuth response:', { data, error })

      if (error) {
        console.log('Error generating OAuth URL:', error)
        return { success: false, error: error.message }
      }

      if (!data || !data.url) {
        console.log('No URL returned from OAuth provider')
        return { success: false, error: 'No URL returned from OAuth provider' }
      }

      console.log('Successfully generated OAuth URL:', data.url)
      
      // Return the URL instead of redirecting
      return {
        success: true,
        url: data.url,
        provider
      }
    } catch (error) {
      console.error('Exception in getOAuthUrl:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  signout: async ({ locals: { supabase }, cookies }) => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return fail(500, { error: 'Failed to sign out' })
    }

    // Clear any session cookies
    cookies.delete('sb-auth-token', { path: '/' })
    cookies.delete('sb-refresh-token', { path: '/' })

    // Redirect to the home page
    return redirect(303, '/')
  },

  // Traditional OAuth flow for account linking (redirects to provider)
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
        // Continue despite error - this handles the case when migration hasn't been run yet
      } else if (existingLinks && existingLinks.length > 0) {
        return fail(400, { error: `Your account is already linked to ${provider}` })
      }
    } catch (err) {
      // Continue despite error
    }

    try {
      // Initiate OAuth flow with link_action parameter to indicate we're linking accounts
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options: {
          redirectTo: `${PUBLIC_SITE_URL}/auth/callback?link_action=true`,
          queryParams: {
            // Add any additional query parameters needed for the OAuth provider
          }
        }
      })

      if (error) {
        return fail(500, { error: error.message })
      }

      // Redirect to the OAuth provider's authorization page
      redirect(303, data.url)
    } catch (error) {
      return fail(500, { error: 'An unexpected error occurred' })
    }
  },

  // Direct identity linking using Supabase's linkIdentity API (no redirect)
  linkIdentity: async ({ request, locals: { supabase, user, safeGetSession } }) => {
    if (!user) {
      return fail(401, { error: 'You must be logged in to link accounts' })
    }

    const formData = await request.formData()
    const provider = formData.get('provider')?.toString()

    if (!provider || !['github', 'discord'].includes(provider)) {
      return fail(400, { error: 'Invalid provider' })
    }

    try {
      // Use Supabase's manual identity linking API
      const { data, error } = await supabase.auth.linkIdentity({
        provider: provider as Provider
      })

      if (error) {
        return fail(500, { error: error.message || 'Failed to link account' })
      }

      // Store the linked identity in our database for better tracking
      const { session } = await safeGetSession()
      if (!session) {
        return fail(401, { error: 'Session expired during account linking' })
      }

      // Everything is already handled by Supabase's identity linking

      return {
        success: true,
        provider,
        message: `Successfully linked ${provider} account`
      }
    } catch (error) {
      return fail(500, { error: 'An unexpected error occurred while linking accounts' })
    }
  },

  // Unlink an identity
  unlinkIdentity: async ({ request, locals: { supabase, user } }) => {
    if (!user) {
      return fail(401, { error: 'You must be logged in to unlink accounts' })
    }

    const formData = await request.formData()
    const provider = formData.get('provider')?.toString()

    if (!provider) {
      return fail(400, { error: 'Invalid provider' })
    }

    try {
      // Get user identities directly from Supabase Auth
      const { data: identities } = await supabase.auth.getUserIdentities()

      // Find the identity to unlink
      const identityToUnlink = identities?.identities?.find(id => id.provider.toLowerCase() === provider.toLowerCase())

      if (!identityToUnlink) {
        return fail(404, { error: `No ${provider} account linked to your profile` })
      }

      // Check if this is the last identity - don't allow unlinking the last one
      // as it would leave the user with no way to log in
      const identityCount = identities?.identities?.length || 0;
      if (identityCount <= 1) {
        return fail(400, { error: `Cannot unlink your only login method. Please link another account first.` })
      }

      // Unlink the identity using Supabase Auth API
      const { error } = await supabase.auth.unlinkIdentity(identityToUnlink)

      if (error) {
        return fail(500, { error: error.message || 'Failed to unlink account' })
      }

      return {
        success: true,
        message: `Successfully unlinked ${provider} account`
      }
    } catch (error) {
      return fail(500, { error: 'An unexpected error occurred while unlinking account' })
    }
  }
}
