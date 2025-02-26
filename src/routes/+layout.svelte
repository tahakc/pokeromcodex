<script lang="ts">
	import "../app.css";
	import Navigation from "$lib/components/navigation.svelte";
	import { isAnyModalOpen } from "$lib/stores/modal";
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
		
		/* Fix potential overflow from embedded content */
		img, svg, video, canvas, audio, iframe, embed, object {
			display: block;
			max-width: 100%;
		}
		
		/* Ensure tables don't cause overflow */
		table {
			display: block;
			width: 100%;
			overflow-x: auto;
		}
		
		/* Ensure pre and code elements don't cause overflow */
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
</div>
