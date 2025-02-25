<script lang="ts">
	import "../app.css";
	import Navigation from "$lib/components/navigation.svelte";
</script>

<div class="min-h-screen bg-background antialiased">
	<Navigation />
	<div class="relative">
		<slot />
	</div>
</div>
