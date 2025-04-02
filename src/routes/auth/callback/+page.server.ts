import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  
  if (!code) {
    throw redirect(303, '/auth?error=no_code');
  }

  try {
    // Exchange the auth code for a session
    // We're using a try-catch here to handle any errors that might occur during the code exchange
    const { error: signInError } = await supabase.auth.exchangeCodeForSession(code);
    if (signInError) throw signInError;

    // Get the user details
    const { data: { user } } = await supabase.auth.getUser();
    
    // If this point is reached, authentication was successful - redirect to dashboard
    throw redirect(303, '/dashboard');
  } catch (error: any) { // Type the error as any to allow property access
    // Only handle errors that aren't redirects
    if (error && error.status === 303) throw error;
    
    console.error('Auth error:', error);
    throw redirect(303, '/auth?error=auth_error');
  }
};
