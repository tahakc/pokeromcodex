<script lang="ts">
  import type { Rom } from "$lib/types";
  import RomListItem from "./rom-list-item.svelte";
  import { fade, fly } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { onMount, tick } from "svelte";
  import { browser } from "$app/environment";

  // Accept either Rom objects or collection items with rom property
  export let roms: (Rom & { slug: string; isInCollection?: boolean } | { rom: Rom & { slug: string }; added_at?: string })[];
  export let isLoading = false;
  export let isPriority = false; // Flag to indicate this is the main content (for LCP optimization)
  
  // Set initialLoad to true to prevent showing 'no roms found' on initial page load
  let initialLoad = true;
  let hasInteracted = false;
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
    // Only mark initial load as complete after a very short delay
    // This ensures we never show 'no roms found' during the initial page load
    if (roms.length > 0) {
      // If we have roms, mark as not initial load immediately
      initialLoad = false;
    } else {
      // Otherwise wait a bit to see if data comes in
      setTimeout(() => {
        initialLoad = false;
      }, 100);
    }
    
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
  
  $: if (browser && observer && processedRoms) {
    tick().then(() => {
      document.querySelectorAll('.rom-list-item-container:not(.is-visible)').forEach((el) => {
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
  
  // Process the roms to ensure they have the right format for RomListItem
  $: processedRoms = (showSkeletons ? skeletonRoms : roms).map(item => {
    if ('rom' in item && item.rom) {
      // This is a collection item
      return {
        ...item.rom,
        isInCollection: true
      };
    } else {
      // This is a regular rom or skeleton
      return item as Rom & { slug: string; isLoading?: boolean; isInCollection?: boolean };
    }
  });
</script>

<style>
  .priority-item {
    content-visibility: auto;
    contain-intrinsic-size: auto 300px;
  }
  
  .rom-list-item-container {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  
  .rom-list-item-container.is-visible,
  .rom-list-item-container.priority-item {
    opacity: 1;
    transform: translateY(0);
  }
</style>

{#if !isLoading && !initialLoad && roms.length === 0}
  <div class="mt-8 text-center" in:fade={{ duration: 300 }}>
    <p class="text-lg text-muted-foreground">No ROM hacks found</p>
  </div>
{:else}
  <div class="flex flex-col space-y-4">
    {#each processedRoms as rom, index (rom.slug || `item-${index}`)}
      <div 
        class={`rom-list-item-container ${index < 4 ? 'priority-item is-visible' : ''}`}
        data-index={index}
        data-priority={isPriority && index === 0 ? 'true' : 'false'}
        animate:flip={{ duration: 300 }}
      >
        <RomListItem {rom} displayRoms={processedRoms} priority={isPriority && index === 0} />
      </div>
    {/each}
  </div>
{/if}
