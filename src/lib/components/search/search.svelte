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
  let loading = true;
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  onMount(async () => {
    if (browser) {
      const url = new URL(window.location.href);
      
      const urlSearchQuery = url.searchParams.get('q');
      if (urlSearchQuery) {
        searchQuery = urlSearchQuery;
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
    
    filterOptions = await getFilterOptions();
    console.log('Filter options loaded:', filterOptions);
    
    await performSearch();
    loading = false;
  });

  async function performSearch() {
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
      
      console.log('Search results:', { count, resultsLength: data.length });
      
      onSearch(data, count);
    } catch (error) {
      console.error('Error performing search:', error);
      onSearch([], 0);
    } finally {
      loading = false;
      onLoadingChange(false);
    }
  }

  function updateURL() {
    if (!browser) return Promise.resolve();
    
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
    
    url.searchParams.set('page', '1');
    
    return goto(url, { keepFocus: true });
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
    
    updateURL().then(() => performSearch());
  }

  async function setupSearchDebounce() {
    if (!browser) return;

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    searchTimeout = setTimeout(async () => {
      await updateURL();
      await performSearch();
    }, 300);
  }
  
  $: if (searchQuery !== undefined && browser) setupSearchDebounce();
  $: if (currentPage && browser) performSearch();

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