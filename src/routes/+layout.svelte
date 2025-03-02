<script lang="ts">
	import "../app.css";
	import Navigation from "$lib/components/navigation.svelte";
	import { isAnyModalOpen } from "$lib/stores/modal";
	import { invalidate } from '$app/navigation'
	import { onMount } from 'svelte'
	import { Toaster } from "$lib/components/ui/sonner";

	let { data, children } = $props()
	let { session, supabase } = $derived(data)

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
		if (newSession?.expires_at !== session?.expires_at) {
			invalidate('supabase:auth')
		}
		})

		return () => data.subscription.unsubscribe()
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
		<slot />
	</div>
	<Toaster 
		position="top-center" 
		closeButton 
		richColors 
		duration={6000}
	/>
</div>
