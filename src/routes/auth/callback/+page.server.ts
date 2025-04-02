import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  
  if (!code) {
    throw redirect(303, '/auth?error=no_code');
  }

  try {
    const { error: signInError } = await supabase.auth.exchangeCodeForSession(code);
    if (signInError) throw signInError;

    const { data: { user } } = await supabase.auth.getUser();
    const { data: identityData } = await supabase.auth.getUserIdentities();

    return {
      user,
      identities: identityData?.identities || [],
      _closePopup: true // Special flag to indicate popup should be closed
    };
  } catch (error) {
    console.error('Auth error:', error);
    throw redirect(303, '/auth?error=auth_error');
  }
};
