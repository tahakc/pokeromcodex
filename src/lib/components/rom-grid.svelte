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
  let isMobile = false;
  
  // Progressive loading of ROM cards
  const setupIntersectionObserver = () => {
    if (!browser || !window.IntersectionObserver) return;
    
    // Check if we're on mobile
    isMobile = window.innerWidth < 640;
    
    // Use different rootMargin for mobile vs desktop
    const rootMargin = isMobile ? '100px' : '200px';
    
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const index = parseInt(element.dataset.index || '0', 10);
          
          // Mark this element as loaded
          element.classList.add('is-visible');
          
          // Stop observing this element
          observer?.unobserve(entry.target);
        }
      });
    }, {
      rootMargin, // Smaller margin on mobile to save resources
      threshold: 0.1
    });
  };
  
  // Function to optimize for mobile
  const optimizeForMobile = () => {
    if (!browser) return;
    
    isMobile = window.innerWidth < 640;
    
    // Add resize listener to update mobile status
    const handleResize = () => {
      isMobile = window.innerWidth < 640;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
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
    
    // Setup intersection observer for progressive loading
    setupIntersectionObserver();
    
    // Setup mobile optimizations
    const cleanupMobileOptimization = optimizeForMobile();
    
    // Return cleanup function directly
    return () => {
      window.removeEventListener('click', trackInteraction);
      window.removeEventListener('keydown', trackInteraction);
      window.removeEventListener('scroll', trackInteraction);
      observer?.disconnect();
      if (cleanupMobileOptimization) cleanupMobileOptimization();
    };
  });
  
  // After the component updates, set up the observer on new elements
  $: if (browser && observer && displayRoms) {
    tick().then(() => {
      document.querySelectorAll('.rom-card-container:not(.is-visible)').forEach((el) => {
        observer?.observe(el);
      });
    });
  }
  
  // Only show skeletons if we're loading, not in the initial load, and user has interacted
  $: showSkeletons = isLoading && !initialLoad && hasInteracted;
  
  // On mobile, show fewer skeleton items to improve performance
  $: skeletonCount = isMobile ? 4 : 8;
  
  $: skeletonRoms = showSkeletons
    ? Array.from({ length: skeletonCount }, (_, i) => ({ 
        slug: `skeleton-${i}`, 
        isLoading: true 
      })) as (Rom & { slug: string; isLoading: boolean })[]
    : [];
  
  // During initial load or before interaction, always show the actual data
  $: displayRoms = showSkeletons ? skeletonRoms : roms;
  
  // Determine how many items should be priority loaded based on device
  $: priorityItemCount = isMobile ? 2 : 4;
</script>

<style>
  /* Ensure priority items are rendered with higher priority */
  .priority-item {
    content-visibility: auto;
    contain-intrinsic-size: auto 300px;
  }
  
  /* Progressive loading styles */
  .rom-card-container {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    will-change: opacity, transform;
  }
  
  .rom-card-container.is-visible,
  .rom-card-container.priority-item {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Mobile-specific optimizations */
  @media (max-width: 640px) {
    .rom-card-container {
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    
    .grid {
      contain: content;
      content-visibility: auto;
    }
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
        class={`rom-card-container ${index < priorityItemCount ? 'priority-item is-visible' : ''}`}
        data-index={index}
        animate:flip={{ duration: 300 }}
      >
        <RomCard {rom} {displayRoms} />
      </div>
    {/each}
  </div>
{/if} 