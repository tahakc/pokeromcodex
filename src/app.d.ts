import 'unplugin-icons/types/svelte'
import type { Session, SupabaseClient, User } from '@supabase/supabase-js'
import type { Database } from './database.types.ts'
declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>
			session: Session | null
			user: User | null
			allUserIds?: string[] // Array of user IDs including the current user and any linked accounts
		  }
		  interface PageData {
			session: Session | null
		  }
	}
}

export {};