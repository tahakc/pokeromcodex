import { redirect, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import type { UserIdentity } from '@supabase/supabase-js'
import { PUBLIC_SITE_URL } from '$env/static/public'

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
  const { session } = await safeGetSession()
  
  if (!session) {
    redirect(303, '/auth/signin')
  }
  
  const { data, error } = await supabase.auth.getUserIdentities()
  
  if (error) {
    console.error('Error fetching user identities:', error)
    return { identities: [] }
  }
  
  return {
    identities: data?.identities || []
  }
}

export const actions: Actions = {
  signout: async ({ locals: { supabase } }) => {
    await supabase.auth.signOut()
    redirect(303, '/')
  },
  
  linkGithub: async ({ locals: { supabase } }) => {
    console.log('Attempting to link GitHub account...');
    
    try {
      // First approach: Try the official linkIdentity method
      try {
        const { data, error } = await supabase.auth.linkIdentity({
          provider: 'github',
          options: {
            redirectTo: `${PUBLIC_SITE_URL}/auth/callback?linked=github`
          }
        });
        
        if (!error && data?.url) {
          console.log('Successfully initiated GitHub linking with linkIdentity');
          return { success: true, url: data.url };
        }
        
        console.log('linkIdentity failed or not supported:', error);
        // If linkIdentity fails, we'll try the alternative approach below
      } catch (linkError) {
        console.error('Error using linkIdentity:', linkError);
        // Continue to alternative approach
      }
    
    } catch (e) {
      console.error('Exception linking GitHub:', e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  },
  
  linkDiscord: async ({ locals: { supabase } }) => {
    console.log('Attempting to link Discord account...');
    
    try {
      try {
        const { data, error } = await supabase.auth.linkIdentity({
          provider: 'discord',
          options: {
            redirectTo: `${PUBLIC_SITE_URL}/auth/callback?linked=discord`
          }
        });
        
        if (!error && data?.url) {
          console.log('Successfully initiated Discord linking with linkIdentity');
          return { success: true, url: data.url };
        }
        
        console.log('linkIdentity failed or not supported:', error);
      } catch (linkError) {
        console.error('Error using linkIdentity:', linkError);
      }
    } catch (e) {
      console.error('Exception linking Discord:', e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  },
  
  unlinkIdentity: async ({ locals: { supabase }, request }) => {
    const formData = await request.formData()
    const identityId = formData.get('identityId')?.toString()
    
    if (!identityId) {
      return fail(400, { error: 'Missing identity ID' })
    }
    
    try {
      const { data: userData, error: fetchError } = await supabase.auth.getUserIdentities()
      
      if (fetchError) {
        return fail(400, { error: fetchError.message })
      }
      
      const identities = userData?.identities || []
      
      const identityToUnlink = identities.find((identity: UserIdentity) => identity.id === identityId)
      
      if (!identityToUnlink) {
        return fail(400, { error: 'Identity not found' })
      }
      
      const { error } = await supabase.auth.unlinkIdentity(identityToUnlink)
      
      if (error) {
        return fail(400, { error: error.message })
      }
      
      return { success: true, provider: identityToUnlink.provider }
    } catch (error) {
      return fail(500, { 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  },
  
  setPreferredProvider: async ({ locals: { supabase }, request }) => {
    const formData = await request.formData()
    const identityId = formData.get('identityId')?.toString()
    
    if (!identityId) {
      return fail(400, { error: 'Missing identity ID' })
    }
    
    try {
      const { data, error: fetchError } = await supabase.auth.getUserIdentities()
      
      if (fetchError) {
        return fail(400, { error: fetchError.message })
      }
      
      const identities = data?.identities || []
      
      const selectedIdentity = identities.find((identity: UserIdentity) => identity.id === identityId)
      
      if (!selectedIdentity) {
        return fail(400, { error: 'Identity not found' })
      }
      
      const { provider } = selectedIdentity
      const { name, full_name, avatar_url } = selectedIdentity.identity_data || {}
      
      const { error } = await supabase.auth.updateUser({
        data: {
          preferred_provider: provider,
          name: name || full_name,
          full_name: full_name || name,
          avatar_url
        }
      })
      
      if (error) {
        return fail(400, { error: error.message })
      }
      
      return { 
        success: true, 
        message: `Display data updated to use ${provider}`,
        provider
      }
    } catch (error) {
      return fail(500, { 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }
} 