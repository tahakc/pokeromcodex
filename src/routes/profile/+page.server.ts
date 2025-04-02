import { redirect, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { PUBLIC_SITE_URL } from '$env/static/public'
import type { Provider } from '@supabase/supabase-js'

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
  const { session, user } = await safeGetSession()

  if (!session) {
    throw redirect(303, '/auth')
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
    if (!user) {
      return fail(401, { error: 'You must be logged in to get OAuth URL' })
    }

    const formData = await request.formData()
    const provider = formData.get('provider')?.toString()

    if (!provider || !['github', 'discord'].includes(provider)) {
      return fail(400, { error: 'Invalid provider' })
    }

    try {
      // Use the built-in linkIdentity method
      const { data, error } = await supabase.auth.linkIdentity({
        provider: provider as Provider,
        options: {
          // Specify where to redirect after OAuth completes
          redirectTo: `${PUBLIC_SITE_URL}/auth/linkCallback`
        }
      })
      
      if (error) {
        console.error('OAuth URL error:', error)
        return fail(500, { error: error.message })
      }

      if (!data || !data.url) {
        console.error('No URL in OAuth response:', data)
        return fail(500, { error: 'No URL returned from OAuth provider' })
      }

      console.log('Generated OAuth URL:', { url: data.url, provider })

      // Return the URL in a format that our client code expects
      return {
        url: data.url,
        provider
      }
    } catch (error) {
      console.error('Exception in getOAuthUrl:', error)
      return fail(500, { error: 'An unexpected error occurred' })
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
    throw redirect(303, '/')
  },

  // Unlink an identity
  unlinkIdentity: async ({ request, locals: { supabase, user } }) => {
    if (!user) {
      return fail(401, { error: 'You must be logged in to unlink accounts' })
    }

    const formData = await request.formData()
    const provider = formData.get('provider')?.toString()

    if (!provider) {
      return fail(400, { error: 'Provider is required' })
    }

    // Get current identities
    const { data: identitiesData } = await supabase.auth.getUserIdentities()
    const identities = identitiesData?.identities || []

    // Check if this is the last identity
    if (identities.length <= 1) {
      return fail(400, { error: 'Cannot unlink the last identity. Please add another login method first.' })
    }

    // Find the identity to unlink
    const identity = identities.find(i => i.provider === provider)
    if (!identity) {
      return fail(404, { error: `No ${provider} identity found` })
    }

    // Attempt to unlink
    try {
      const { error } = await supabase.auth.unlinkIdentity(identity)
      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error unlinking identity:', error)
      return fail(500, { error: 'Failed to unlink identity' })
    }
  }
}
