<script lang="ts">
  import type { Rom, SearchFilters } from "$lib/types";
  import SearchBar from "./search-bar.svelte";
  import Filters from "./filters.svelte";
  import { ensureArray } from "$lib/types";
  import { Button } from "$lib/components/ui/button";
  import { ChevronDown } from "lucide-svelte";
  import { slide } from "svelte/transition";
  import { onMount } from "svelte";
  import { getFilterOptions, searchRoms } from "$lib/services/rom-service";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { browser } from "$app/environment";

  export let onSearch: (roms: (Rom & { slug: string })[], count: number) => void;
  export let onLoadingChange: (loading: boolean) => void = () => {};
  export let currentPage = 1;
  export let pageSize = 20;
  export let skipInitialSearch = false;

  let searchQuery = "";
  let showFilters = false;
  let selectedFilters: SearchFilters = {
    baseGame: [],
    status: [],
    difficulty: [],
    features: [],
  };
  let filterOptions = {
    baseGames: [] as string[],
    statuses: [] as string[],
    difficulties: [] as string[],
    features: [] as string[],
  };
  let loading = false;
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;
  let isInitialLoad = true;
  let prevPage = currentPage;
  let lastSearchQuery = searchQuery;
  let hasInteracted = false;
  let pageBeforeSearch: number | null = null;

  function initializeFilters() {
    if (browser) {
      const url = new URL(window.location.href);
      
      const urlSearchQuery = url.searchParams.get('q');
      if (urlSearchQuery) {
        searchQuery = urlSearchQuery;
        lastSearchQuery = urlSearchQuery;
      }
      
      // Initialize page from URL
      const urlPage = url.searchParams.get('page');
      if (urlPage) {
        currentPage = parseInt(urlPage, 10);
        prevPage = currentPage;
      }
      
      const baseGame = url.searchParams.get('baseGame')?.split(',').filter(Boolean) || [];
      const status = url.searchParams.get('status')?.split(',').filter(Boolean) || [];
      const difficulty = url.searchParams.get('difficulty')?.split(',').filter(Boolean) || [];
      const features = url.searchParams.get('features')?.split(',').filter(Boolean) || [];
      
      selectedFilters = {
        baseGame,
        status,
        difficulty,
        features
      };
    }
  }
  function loadFiltersAndSearch() {
    if (browser) {
      getFilterOptions().then(options => {
        filterOptions = options;
        const hasFilters = Object.values(selectedFilters).some(arr => arr.length > 0);
        const hasQuery = !!searchQuery;
        const isNotFirstPage = currentPage !== 1;
        
        if (!skipInitialSearch && (hasFilters || hasQuery || isNotFirstPage)) {
          performSearch();
        }
        isInitialLoad = false;
        onLoadingChange(false);
      });
    }
  }
  onMount(() => {
    initializeFilters();
    loadFiltersAndSearch();
    const trackInteraction = () => {
      hasInteracted = true;
    };
    
    window.addEventListener('click', trackInteraction);
    window.addEventListener('keydown', trackInteraction);
    window.addEventListener('scroll', trackInteraction);
    return () => {
      window.removeEventListener('click', trackInteraction);
      window.removeEventListener('keydown', trackInteraction);
      window.removeEventListener('scroll', trackInteraction);
    };
  });

  async function performSearch() {
    if (isInitialLoad || !hasInteracted) {
      try {
        const { data, count } = await searchRoms(
          searchQuery,
          selectedFilters,
          currentPage,
          pageSize
        );
        
        console.log('Search results:', { count, resultsLength: data.length, currentPage });
        
        onSearch(data, count);
      } catch (error) {
        console.error('Error performing search:', error);
        onSearch([], 0);
      }
      return;
    }
    
    if (loading) return;
    
    loading = true;
    onLoadingChange(true);
    console.log('Performing search with:', { searchQuery, selectedFilters, currentPage, pageSize });
    
    try {
      const { data, count } = await searchRoms(
        searchQuery,
        selectedFilters,
        currentPage,
        pageSize
      );
      
      console.log('Search results:', { count, resultsLength: data.length, currentPage });
      
      onSearch(data, count);
    } catch (error) {
      console.error('Error performing search:', error);
      onSearch([], 0);
    } finally {
      loading = false;
      onLoadingChange(false);
    }
  }

  function handleFilterChange(
    category: keyof SearchFilters,
    value: string
  ) {
    console.log('Filter change:', { category, value });
    
    const index = selectedFilters[category].indexOf(value);
    if (index === -1) {
      selectedFilters[category] = [...selectedFilters[category], value];
    } else {
      selectedFilters[category] = selectedFilters[category].filter((v) => v !== value);
    }
    
    console.log('Updated filters:', selectedFilters);
    
    const url = new URL(window.location.href);
    
    if (searchQuery) {
      url.searchParams.set('q', searchQuery);
    } else {
      url.searchParams.delete('q');
    }
    
    Object.entries(selectedFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        url.searchParams.set(key, values.join(','));
      } else {
        url.searchParams.delete(key);
      }
    });
    
    if (url.searchParams.get('page') !== String(currentPage)) {
      url.searchParams.set('page', String(currentPage));
    }
    
    goto(url, { keepFocus: true }).then(() => performSearch());
  }

  async function setupSearchDebounce() {
    if (!browser || isInitialLoad) return;

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    searchTimeout = setTimeout(async () => {
      const url = new URL(window.location.href);
      const currentUrl = new URL(window.location.href);
      let urlChanged = false;
      
      // Store the page before a new search
      if (searchQuery !== lastSearchQuery) {
        if (searchQuery && !lastSearchQuery) {
          // Starting a new search
          pageBeforeSearch = currentPage;
          currentPage = 1;
        } else if (!searchQuery && lastSearchQuery) {
          // Clearing the search
          currentPage = pageBeforeSearch || 1;
          pageBeforeSearch = null;
        }
        lastSearchQuery = searchQuery;
        urlChanged = true;
      }
      
      if (searchQuery) {
        if (currentUrl.searchParams.get('q') !== searchQuery) {
          url.searchParams.set('q', searchQuery);
          urlChanged = true;
        }
      } else {
        if (currentUrl.searchParams.has('q')) {
          url.searchParams.delete('q');
          urlChanged = true;
        }
      }
      
      Object.entries(selectedFilters).forEach(([key, values]) => {
        const currentValues = currentUrl.searchParams.get(key)?.split(',').filter(Boolean) || [];
        if (values.length > 0) {
          if (JSON.stringify(values) !== JSON.stringify(currentValues)) {
            url.searchParams.set(key, values.join(','));
            urlChanged = true;
          }
        } else if (currentValues.length > 0) {
          url.searchParams.delete(key);
          urlChanged = true;
        }
      });
      
      // Update page parameter
      if (currentPage !== 1) {
        url.searchParams.set('page', String(currentPage));
      } else {
        url.searchParams.delete('page');
      }
      
      if (urlChanged) {
        await goto(url, { keepFocus: true });
      }
      
      await performSearch();
    }, 300);
  }

  $: if (searchQuery !== undefined && browser && !isInitialLoad) setupSearchDebounce();
  
  // Handle page changes
  $: if (!isInitialLoad && currentPage !== prevPage) {
    const url = new URL(window.location.href);
    if (currentPage !== 1) {
      url.searchParams.set('page', String(currentPage));
    } else {
      url.searchParams.delete('page');
    }
    prevPage = currentPage;
    goto(url, { keepFocus: true }).then(() => performSearch());
  }

  $: activeFiltersCount = Object.values(selectedFilters).reduce(
    (acc, filters) => acc + filters.length,
    0
  );
</script>

<div class="space-y-4">
  <div class="relative">
    <SearchBar 
      value={searchQuery} 
      onChange={(value) => searchQuery = value} 
      showFiltersButton={true}
      onFiltersClick={() => showFilters = !showFilters}
      filtersActive={activeFiltersCount > 0}
      filtersCount={activeFiltersCount}
      filtersOpen={showFilters}
    />
  </div>

  {#if showFilters}
    <div 
      transition:slide={{ duration: 200 }}
      class="overflow-hidden rounded-lg border bg-card p-4 shadow-sm"
    >
      <Filters
        {filterOptions}
        {selectedFilters}
        onFilterChange={handleFilterChange}
      />
    </div>
  {/if}

  {#if loading}
    <div class="flex justify-center py-4">
      <div class="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  {/if}
</div> 