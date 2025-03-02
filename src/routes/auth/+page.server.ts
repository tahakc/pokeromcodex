import { redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
  login: async ({ request, url, locals: { supabase } }) => {
    const formData = await request.formData()
    const provider = formData.get('provider')?.toString() || ''

    if (!['github', 'discord'].includes(provider)) {
      return {
        error: 'Invalid provider'
      }
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'github' | 'discord',
      options: {
        redirectTo: `${url.origin}/auth/callback`
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