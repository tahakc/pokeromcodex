import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/profile'
  const linked = url.searchParams.get('linked')
  const error = url.searchParams.get('error')
  const errorCode = url.searchParams.get('error_code')
  const errorDescription = url.searchParams.get('error_description')

  console.log('Auth callback received:', { 
    code: code ? 'present' : 'not present', 
    linked, 
    params: Object.fromEntries(url.searchParams.entries()) 
  });
  if (error) {
    const redirectParams = new URLSearchParams()
    if (error) redirectParams.set('error', error)
    if (errorCode) redirectParams.set('error_code', errorCode)
    if (errorDescription) redirectParams.set('error_description', errorDescription)
    if (linked) redirectParams.set('linked', linked)
    
    return redirect(303, `/profile?${redirectParams.toString()}`)
  }

  if (code) {
    try {
      const { data: beforeData } = await supabase.auth.getUser();
      console.log('User before exchanging code:', beforeData?.user?.id);
      console.log('Exchanging code for session...');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        const params = new URLSearchParams()
        params.set('error', error.name || 'Auth error')
        params.set('error_description', error.message)
        return redirect(303, `/profile?${params.toString()}`)
      }
      const { data: afterData } = await supabase.auth.getUser();
      console.log('User after exchanging code:', afterData?.user?.id);
      const { data: identitiesData } = await supabase.auth.getUserIdentities();
      console.log('User identities:', identitiesData?.identities?.map(i => i.provider) || []);
      if (linked) {
        console.log(`Identity linked successfully: ${linked}`)
        return redirect(303, `/profile?linked=${linked}`)
      }
    } catch (error) {
      console.error('Exception in auth callback:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      const params = new URLSearchParams()
      params.set('error', 'Exception')
      params.set('error_description', errorMessage)
      return redirect(303, `/profile?${params.toString()}`)
    }
  }

  return redirect(303, next)
} 