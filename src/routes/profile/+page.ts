import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent, fetch }) => {
  const { supabase, session } = await parent();
  
  if (!session) {
    throw redirect(303, '/auth');
  }
  
  const { data, error } = await supabase.auth.getUserIdentities();
  
  if (error) {
    console.error('Error fetching user identities:', error);
  }
  
  return {
    identities: data?.identities || []
  };
}; 