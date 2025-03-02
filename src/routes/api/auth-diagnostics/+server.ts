import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
  try {
    const { session, user } = await safeGetSession();
    
    const { data: identitiesData, error: identitiesError } = await supabase.auth.getUserIdentities();
    
    
    return json({
      status: 'success',
      authenticated: !!session,
      userId: user?.id,
      email: user?.email,
      provider: user?.app_metadata?.provider,
      identities: identitiesData?.identities || [],
      identitiesError: identitiesError?.message,
      userMetadata: user?.user_metadata,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in auth diagnostics:', error);
    return json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}; 