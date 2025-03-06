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

  // If user is authenticated, check for linked accounts
  if (user) {
    try {
      // Get all user IDs associated with this user (primary and linked)
      const { data: linkedAccounts } = await event.locals.supabase
        .from('user_identity_map')
        .select('primary_user_id, linked_user_id')
        .or(`primary_user_id.eq.${user.id},linked_user_id.eq.${user.id}`)
      
      // Create an array of all user IDs (current user + linked accounts)
      const allUserIds = [user.id]
      
      if (linkedAccounts && linkedAccounts.length > 0) {
        // Add primary user IDs if the current user is a linked account
        linkedAccounts.forEach(link => {
          if (link.linked_user_id === user.id) {
            allUserIds.push(link.primary_user_id)
          }
          // Add linked user IDs if the current user is a primary account
          if (link.primary_user_id === user.id) {
            allUserIds.push(link.linked_user_id)
          }
        })
      }
      
      // Store all associated user IDs in the event locals for use in API endpoints
      event.locals.allUserIds = [...new Set(allUserIds)] // Remove duplicates
      console.log('All associated user IDs:', event.locals.allUserIds)
    } catch (error) {
      console.error('Error fetching linked accounts:', error)
      // If there's an error, just use the current user ID
      event.locals.allUserIds = [user.id]
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

export const handle: Handle = sequence(supabase, authGuard)