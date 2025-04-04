<script lang="ts">
  import type { Rom } from "$lib/types";
  import RomCard from "./rom-card.svelte";
  import { fade, fly } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { onMount, tick } from "svelte";
  import { browser } from "$app/environment";

  export let roms: (Rom & { slug: string; isInCollection?: boolean })[];
  export let isLoading = false;
  
  let initialLoad = true;
  let hasInteracted = false;
  let visibleRoms: (Rom & { slug: string })[] = [];
  let observer: IntersectionObserver | null = null;
  
  const setupIntersectionObserver = () => {
    if (!browser || !window.IntersectionObserver) return;
    
    // Use a more efficient intersection observer with higher rootMargin
    // to start loading before elements enter viewport
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const index = parseInt(element.dataset.index || '0', 10);
          
          // Add visible class to trigger the animation
          element.classList.add('is-visible');
          
          // Stop observing once visible
          observer?.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '300px', // Increased for earlier loading
      threshold: 0.01 // Lower threshold for quicker triggering
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
        id: -i,
        name: `Loading...`,
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
    will-change: transform;
  }
  
  .rom-card-container {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    contain: layout style;
  }
  
  .rom-card-container.is-visible,
  .rom-card-container.priority-item {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Optimize for first visible items (LCP candidates) */
  .rom-card-container:nth-child(-n+2) {
    contain: none !important;
    content-visibility: visible !important;
  }
</style>

{#if !isLoading && roms.length === 0}
  <div class="mt-8 text-center" in:fade={{ duration: 300 }}>
    <p class="text-lg text-muted-foreground">No ROM hacks found</p>
  </div>
{:else}
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {#each displayRoms as rom, index (rom.slug || `item-${index}`)}
      <div 
        class={`rom-card-container h-full ${index < 8 ? 'priority-item is-visible' : ''}`}
        data-index={index}
        animate:flip={{ duration: 300 }}
        style={index < 2 ? 'contain: none; content-visibility: visible;' : ''}
      >
        <div class="h-full">
          <RomCard {rom} {index} />
        </div>
      </div>
    {/each}
  </div>
{/if} 