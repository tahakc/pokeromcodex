<script lang="ts">
	import "../app.css";
	import Navigation from "$lib/components/navigation.svelte";
	import { isAnyModalOpen } from "$lib/stores/modal";
</script>

<svelte:head>
	<style>
		html.modal-open,
		body.modal-open {
			touch-action: none;
			-webkit-overflow-scrolling: none;
			overscroll-behavior: none;
		}

		.modal-open-container {
			width: 100%;
			position: relative;
		}
	</style>
</svelte:head>

<div class="min-h-screen bg-background antialiased modal-open-container">
	<Navigation />
	<div class="relative">
		<slot />
	</div>
</div>
