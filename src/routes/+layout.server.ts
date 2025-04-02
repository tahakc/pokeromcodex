import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, locals, cookies }) => {
  const { session } = await safeGetSession()
  return {
    session,
    cookies: cookies.getAll(),
    // Pass the allUserIds array if available
    allUserIds: locals.allUserIds || []
  }
}