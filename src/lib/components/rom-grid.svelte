<script lang="ts">
  import type { Rom } from "$lib/types";
  import RomCard from "./rom-card.svelte";
  import { fade, fly } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { onMount } from "svelte";

  export let roms: (Rom & { slug: string })[];
  export let isLoading = false;
  
  let initialLoad = true;
  let hasInteracted = false;
  
  onMount(() => {
    // Mark initial load as complete after a short delay
    setTimeout(() => {
      initialLoad = false;
    }, 500);
    
    // Track user interaction
    const trackInteraction = () => {
      hasInteracted = true;
    };
    
    window.addEventListener('click', trackInteraction);
    window.addEventListener('keydown', trackInteraction);
    window.addEventListener('scroll', trackInteraction);
    
    // Return cleanup function directly
    return () => {
      window.removeEventListener('click', trackInteraction);
      window.removeEventListener('keydown', trackInteraction);
      window.removeEventListener('scroll', trackInteraction);
    };
  });
  
  // Only show skeletons if we're loading, not in the initial load, and user has interacted
  $: showSkeletons = isLoading && !initialLoad && hasInteracted;
  
  $: skeletonRoms = showSkeletons
    ? Array.from({ length: 8 }, (_, i) => ({ 
        slug: `skeleton-${i}`, 
        isLoading: true 
      })) as (Rom & { slug: string; isLoading: boolean })[]
    : [];
  
  // During initial load or before interaction, always show the actual data
  $: displayRoms = showSkeletons ? skeletonRoms : roms;
</script>

{#if !isLoading && roms.length === 0}
  <div class="mt-8 text-center" in:fade={{ duration: 300 }}>
    <p class="text-lg text-muted-foreground">No ROM hacks found</p>
  </div>
{:else}
  <div 
    class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  >
    {#each displayRoms as rom (rom.slug)}
      <div 
        in:fly={{ y: 20, duration: 300, delay: 100 }}
        animate:flip={{ duration: 300 }}
      >
        <RomCard {rom} {displayRoms} />
      </div>
    {/each}
  </div>
{/if} 