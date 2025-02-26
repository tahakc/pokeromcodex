<script lang="ts">
  import RomGrid from "$lib/components/rom-grid.svelte";
  import Search from "$lib/components/search/search.svelte";
  import type { Rom } from "$lib/types";
  import { fade, fly } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import { ChevronLeft, ChevronRight } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { isAnyModalOpen } from "$lib/stores/modal";
  import SeoHead from "$lib/components/seo/seo-head.svelte";

  export let data;
  
  let filteredRoms = data.roms;
  let totalCount = data.count;
  let error = data.error || false;
  let currentPage = data.page;
  const pageSize = data.pageSize;
  let isLoading = false;
  $: totalPages = Math.ceil(totalCount / pageSize);

  function handleSearch(roms: (Rom & { slug: string })[], count: number) {
    filteredRoms = roms;
    totalCount = count;
    totalPages = Math.ceil(count / pageSize);
  }

  function setLoadingState(loading: boolean) {
    isLoading = loading;
  }

  async function handlePageChange(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages) {
      const url = new URL($page.url);
      url.searchParams.set('page', newPage.toString());
      await goto(url, { keepFocus: true });
      currentPage = newPage;
    }
  }
</script>

<SeoHead 
  title={data.meta.title}
  description={data.meta.description}
/>

<svelte:head>
  <style>
    .home-page {
      transition: none !important;
      position: relative;
      z-index: 1;
      max-width: 100vw;
      overflow-x: hidden;
    }
    body.modal-open .home-page .gradient-bg {
      transform: none !important;
      opacity: 0.25 !important;
      transition: none !important;
      animation: none !important;
    }
    
    .gradient-container {
      position: relative;
      overflow: hidden;
      width: 100%;
    }
    
    .gradient-bg {
      position: absolute;
      pointer-events: none;
      width: 100%;
    }
    
    h1, p {
      overflow-wrap: break-word;
      word-wrap: break-word;
      word-break: break-word;
      hyphens: auto;
    }
    
    @media (max-width: 640px) {
      .mx-auto {
        max-width: 100%;
        padding-left: 1rem;
        padding-right: 1rem;
      }
      
      .gradient-bg div {
        max-width: calc(100vw - 2rem);
      }
    }
  </style>
</svelte:head>

<div class="relative home-page">
  <div class="relative isolate overflow-hidden gradient-container">
    <div class="absolute inset-x-0 top-[-50%] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-30%] gradient-bg" aria-hidden="true">
      <div
        class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-25 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
      ></div>
    </div>

    <div class="py-12 sm:py-16 lg:pb-40">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div
          in:fade={{ duration: 500 }}
          class="mx-auto max-w-2xl text-center"
        >
          <h1 class="text-4xl font-bold tracking-tight sm:text-6xl">
            PokeRomCodex
          </h1>
          <p class="mt-6 text-lg leading-8 text-muted-foreground">
            Discover and explore the best Pokémon ROM hacks. Your gateway to enhanced Pokémon adventures.
          </p>
        </div>

        <div
          in:fly={{ y: 20, duration: 500, delay: 200 }}
          class="mx-auto mt-16 max-w-2xl sm:mt-20"
        >
          <Search 
            onSearch={handleSearch} 
            currentPage={currentPage} 
            pageSize={pageSize} 
            onLoadingChange={setLoadingState}
          />
        </div>
      </div>
    </div>

    <div class="absolute inset-x-0 bottom-[-25%] -z-10 transform-gpu overflow-hidden blur-3xl gradient-bg" aria-hidden="true">
      <div
        class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-25 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
        style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
      ></div>
    </div>
  </div>

  <div
    in:fade={{ duration: 500, delay: 400 }}
    class="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 mt-8"
  >
    {#if error}
      <div class="flex justify-center items-center h-64">
        <div class="text-lg text-muted-foreground">Failed to load ROM hacks. Please try again later.</div>
      </div>
    {:else}
      <div class="mb-6 flex justify-between items-center">
        <div class="text-muted-foreground">
          Showing {filteredRoms.length} of {totalCount} {totalCount === 1 ? 'result' : 'results'}
        </div>
        
        {#if totalPages > 1}
          <div class="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              on:click={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft class="h-4 w-4" />
              <span class="sr-only">Previous page</span>
            </Button>
            
            <div class="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === totalPages}
              on:click={() => handlePageChange(currentPage + 1)}
            >
              <ChevronRight class="h-4 w-4" />
              <span class="sr-only">Next page</span>
            </Button>
          </div>
        {/if}
      </div>
      
      <RomGrid roms={filteredRoms} {isLoading} />
      
      {#if totalPages > 1}
        <div class="my-8 flex justify-center">
          <div class="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              on:click={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft class="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div class="flex space-x-1">
              {#each Array(Math.min(5, totalPages)) as _, i}
                {@const pageNum = currentPage > 3 && totalPages > 5 
                  ? (currentPage - 3) + i + (currentPage > totalPages - 2 ? totalPages - currentPage - 2 : 0)
                  : i + 1}
                {#if pageNum <= totalPages}
                  <Button 
                    variant={pageNum === currentPage ? "default" : "outline"} 
                    size="sm"
                    on:click={() => handlePageChange(pageNum)}
                    class="w-9"
                  >
                    {pageNum}
                  </Button>
                {/if}
              {/each}
              
              {#if totalPages > 5 && currentPage < totalPages - 2}
                <div class="flex items-center px-2">...</div>
                <Button 
                  variant="outline" 
                  size="sm"
                  on:click={() => handlePageChange(totalPages)}
                  class="w-9"
                >
                  {totalPages}
                </Button>
              {/if}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === totalPages}
              on:click={() => handlePageChange(currentPage + 1)}
            >
              Next
              <ChevronRight class="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>
