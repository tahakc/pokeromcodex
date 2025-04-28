<script lang="ts">
	import "../app.css";
	import Navigation from "$lib/components/navigation.svelte";
	import { invalidate } from '$app/navigation'
	import { onMount } from 'svelte'
	import { Toaster } from "$lib/components/ui/sonner";
	import { browser } from '$app/environment';

	let { data, children } = $props()
	let { session, supabase } = $derived(data)

	onMount(() => {
		const relevantAuthEvents = new Set([
			'SIGNED_IN',
			'SIGNED_OUT',
			'USER_UPDATED',
			'PASSWORD_RECOVERY',
		]);

		const { data: authListenerData } = supabase.auth.onAuthStateChange(async (event, newSession) => {
			// Only invalidate layout data if the event is significant
			if (relevantAuthEvents.has(event)) {
			await invalidate('/');
		}
	});

		// Check for auth state flags and handle them (only runs on initial mount)
		if (typeof localStorage !== 'undefined') {
			// Handle fresh login flag
			const freshLogin = localStorage.getItem('freshLogin');
			if (freshLogin === 'true') {
				localStorage.removeItem('freshLogin');
			}

			// Handle sign out flag
			const signedOut = localStorage.getItem('signedOut');
			if (signedOut === 'true') {
				localStorage.removeItem('signedOut');
			}
		}

		return () => authListenerData.subscription.unsubscribe();
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
		/* Optimize LCP image rendering */
		img.object-cover {
			will-change: transform;
			transform: translateZ(0);
			backface-visibility: hidden;
		}
		/* Prioritize rendering of visible elements */
		.priority-item img {
			contain: paint;
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
	{#if browser}
	<Toaster
		position="top-center"
		closeButton
		richColors
		duration={6000}
	/>
	{/if}
</div>
