import { redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { PUBLIC_SITE_URL } from '$env/static/public'

export const actions: Actions = {
  login: async ({ request, url, locals: { supabase } }) => {
    const formData = await request.formData()
    const provider = formData.get('provider')?.toString() || ''

    console.log('Login attempt with provider:', provider)

    if (!['github', 'discord'].includes(provider)) {
      console.error('Invalid provider:', provider)
      return {
        error: 'Invalid provider'
      }
    }

    // Make sure the redirect URL doesn't create a double slash issue
    const redirectPath = '/auth/callback';
    const redirectUrl = PUBLIC_SITE_URL.endsWith('/') 
      ? `${PUBLIC_SITE_URL.slice(0, -1)}${redirectPath}`
      : `${PUBLIC_SITE_URL}${redirectPath}`;
      
    console.log('Attempting OAuth sign in with:', {
      provider,
      redirectUrl,
      scopes: provider === 'discord' ? 'identify email' : 'user:email'
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'github' | 'discord',
      options: {
        redirectTo: redirectUrl,
        scopes: provider === 'discord' ? 'identify email' : 'user:email',
        queryParams: provider === 'github' ? {
          prompt: 'consent'
        } : undefined
      }
    })

    console.log('OAuth response:', { data, error })

    if (error) {
      console.error('OAuth error:', error)
      return {
        error: error.message
      }
    }

    if (!data.url) {
      console.error('No OAuth URL returned')
      return {
        error: 'No OAuth URL returned'
      }
    }

    console.log('Redirecting to:', data.url)
    // Instead of throwing redirect, return a redirect response
    return {
      status: 303,
      redirect: data.url
    }
  }
}