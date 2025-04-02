<script lang="ts">
	import "../app.css";
	import Navigation from "$lib/components/navigation.svelte";
	import { isAnyModalOpen } from "$lib/stores/modal";
	import { invalidate } from '$app/navigation'
	import { onMount } from 'svelte'
	import { Toaster } from "$lib/components/ui/sonner";
	import { goto } from '$app/navigation';
	import { toast } from "$lib/components/ui/sonner";

	let { data, children } = $props()
	let { session, supabase } = $derived(data)

	onMount(() => {
		// Set up auth state change listener
		const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
			// Force immediate invalidation of auth state
			await invalidate('supabase:auth');
			await invalidate('app:auth');
			await invalidate('/');
			
			// Handle sign in event
			if (event === 'SIGNED_IN') {
				// Only show toast if not coming from callback page
				if (!window.location.pathname.includes('/auth/callback')) {
					toast.success('Successfully signed in!');
					goto('/dashboard');
				}
			}
		});
		
		// Check for auth state flags and handle them
		if (typeof localStorage !== 'undefined') {
			// Handle fresh login flag
			const freshLogin = localStorage.getItem('freshLogin');
			if (freshLogin === 'true') {
				localStorage.removeItem('freshLogin');
				
				// Force invalidation to update UI
				invalidate('supabase:auth');
				invalidate('app:auth');
			}
			
			// Handle sign out flag
			const signedOut = localStorage.getItem('signedOut');
			if (signedOut === 'true') {
				localStorage.removeItem('signedOut');
				
				// Force invalidation to update UI after sign out
				invalidate('supabase:auth');
				invalidate('app:auth');
				invalidate('/');
			}
		}
		
		return () => data.subscription.unsubscribe();
	})
</script>

<svelte:head>
	<style>
		html, body {
			max-width: 100%;
			overflow-x: hidden;
		}
		
		html.modal-open,
		body.modal-open {
			touch-action: none;
			-webkit-overflow-scrolling: none;
			overscroll-behavior: none;
		}

		.modal-open-container {
			width: 100%;
			position: relative;
			overflow-x: hidden;
		}
		img, svg, video, canvas, audio, iframe, embed, object {
			display: block;
			max-width: 100%;
		}
		table {
			display: block;
			width: 100%;
			overflow-x: auto;
		}
		pre, code {
			white-space: pre-wrap;
			word-break: break-word;
			max-width: 100%;
			overflow-x: auto;
		}
	</style>
</svelte:head>

<div class="min-h-screen bg-background antialiased modal-open-container">
	<Navigation />
	<div class="relative overflow-hidden">
		{@render children()}
	</div>
	<Toaster 
		position="top-center" 
		closeButton 
		richColors 
		duration={6000}
	/>
</div>
