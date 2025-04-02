import { createServerClient } from '@supabase/ssr'
import { type Handle, redirect } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

const supabase: Handle = async ({ event, resolve }) => {

  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: '/' })
        })
      },
    },
  })

  event.locals.safeGetSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()
    if (!session) {
      return { session: null, user: null }
    }

    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser()
    if (error) {
      return { session: null, user: null }
    }

    return { session, user }
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version'
    },
    transformPageChunk: ({ html }) => {
      // This ensures proper serialization of boolean values during SSR
      return html.replace(
        /isInCollection=(false|true)/g, 
        (match, value) => `isInCollection={${value}}`
      );
    }
  })
}

const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession()
  event.locals.session = session
  event.locals.user = user

  // If user is authenticated, get all associated user IDs for linked accounts
  if (event.locals.user) {
    // Get all identities linked to this user
    const { data: identities, error: identitiesError } = await event.locals.supabase.auth.getUserIdentities();
    
    if (!identitiesError && identities?.identities) {
      // Extract all unique user IDs from the identities
      const associatedIds = new Set<string>([event.locals.user.id]);
      
      // Only include IDs that match the UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      // Filter and add valid UUID identities
      identities.identities.forEach(identity => {
        if (identity.id && uuidRegex.test(identity.id)) {
          associatedIds.add(identity.id);
        }
      });
      
      // Store all user IDs in the event locals for use in routes
      event.locals.allUserIds = Array.from(associatedIds);
    } else {
      // If no linked identities or error, just use the current user ID
      event.locals.allUserIds = [event.locals.user.id];
    }
  }

  if (!event.locals.session && event.url.pathname.startsWith('/dashboard')) {
    redirect(303, '/auth')
  }

  if (event.locals.session && event.url.pathname === '/auth') {
    redirect(303, '/dashboard')
  }

  return resolve(event)
}

export const handle = sequence(supabase, authGuard)