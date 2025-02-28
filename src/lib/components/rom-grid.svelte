<script lang="ts">
  import type { Rom } from "$lib/types";
  import RomCard from "./rom-card.svelte";
  import { fade, fly } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { onMount, tick } from "svelte";
  import { browser } from "$app/environment";

  export let roms: (Rom & { slug: string })[];
  export let isLoading = false;
  
  let initialLoad = true;
  let hasInteracted = false;
  let visibleRoms: (Rom & { slug: string })[] = [];
  let observer: IntersectionObserver | null = null;
  
  const setupIntersectionObserver = () => {
    if (!browser || !window.IntersectionObserver) return;
    
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const index = parseInt(element.dataset.index || '0', 10);
          
          element.classList.add('is-visible');
          
          observer?.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '200px',
      threshold: 0.1
    });
  };
  
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
    
    setupIntersectionObserver();
    
    // Return cleanup function directly
    return () => {
      window.removeEventListener('click', trackInteraction);
      window.removeEventListener('keydown', trackInteraction);
      window.removeEventListener('scroll', trackInteraction);
      observer?.disconnect();
    };
  });
  
  $: if (browser && observer && displayRoms) {
    tick().then(() => {
      document.querySelectorAll('.rom-card-container:not(.is-visible)').forEach((el) => {
        observer?.observe(el);
      });
    });
  }
  
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

<style>
  .priority-item {
    content-visibility: auto;
    contain-intrinsic-size: auto 300px;
  }
  
  .rom-card-container {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  
  .rom-card-container.is-visible,
  .rom-card-container.priority-item {
    opacity: 1;
    transform: translateY(0);
  }
</style>

{#if !isLoading && roms.length === 0}
  <div class="mt-8 text-center" in:fade={{ duration: 300 }}>
    <p class="text-lg text-muted-foreground">No ROM hacks found</p>
  </div>
{:else}
  <div 
    class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  >
    {#each displayRoms as rom, index (rom.slug)}
      <div 
        class={`rom-card-container ${index < 4 ? 'priority-item is-visible' : ''}`}
        data-index={index}
        animate:flip={{ duration: 300 }}
      >
        <RomCard {rom} {displayRoms} />
      </div>
    {/each}
  </div>
{/if} 