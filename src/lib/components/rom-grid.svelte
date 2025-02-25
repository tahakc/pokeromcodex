<script lang="ts">
  import type { Rom } from "$lib/types";
  import RomCard from "./rom-card.svelte";
  import { fade, fly } from "svelte/transition";
  import { flip } from "svelte/animate";

  export let roms: (Rom & { slug: string })[];
  export let isLoading = false;
  
  $: skeletonRoms = isLoading 
    ? Array.from({ length: 8 }, (_, i) => ({ 
        slug: `skeleton-${i}`, 
        isLoading: true 
      })) as (Rom & { slug: string; isLoading: boolean })[]
    : [];
  
  $: displayRoms = isLoading ? skeletonRoms : roms;
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
        <RomCard {rom} />
      </div>
    {/each}
  </div>
{/if} 