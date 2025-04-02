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

    // Instead of returning data for the popup, redirect back to the profile page
    throw redirect(303, '/profile?linked=true');
  } catch (error: any) { // Type the error as any to allow property access
    if (error.status === 303) throw error; // Re-throw redirects
    
    console.error('Auth error:', error);
    throw redirect(303, '/auth?error=auth_error');
  }
};
