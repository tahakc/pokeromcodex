import { redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { PUBLIC_SITE_URL } from '$env/static/public'
export const actions: Actions = {
  login: async ({ request, url, locals: { supabase } }) => {
    const formData = await request.formData()
    const provider = formData.get('provider')?.toString() || ''

    if (!['github', 'discord'].includes(provider)) {
      return {
        error: 'Invalid provider'
      }
    }

    // Make sure the redirect URL doesn't create a double slash issue
    const redirectPath = '/auth/callback';
    const redirectUrl = PUBLIC_SITE_URL.endsWith('/') 
      ? `${PUBLIC_SITE_URL.slice(0, -1)}${redirectPath}`
      : `${PUBLIC_SITE_URL}${redirectPath}`;
      
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'github' | 'discord',
      options: {
        redirectTo: redirectUrl
      }
    })

    if (error) {
      return {
        error: error.message
      }
    }

    redirect(303, data.url)
  }
} 