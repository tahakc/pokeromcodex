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
    // Determine the correct page number for the API call
    // If a search query is active, always search from page 1
    // Otherwise, use the current page (which might have been restored after clearing search)
    const pageForSearch = searchQuery ? 1 : currentPage;

    if (loading) return; // Prevent concurrent searches

    loading = true;
    onLoadingChange(true);

    try {
      // Use pageForSearch for the API call
      const { data, count } = await searchRoms(
        searchQuery,
        selectedFilters,
        pageForSearch, // Use the calculated page number
        pageSize
      );

      onSearch(data, count);
    } catch (error) {
      console.error('Error performing search:', error);
      onSearch([], 0); // Return empty results on error
    } finally {
      loading = false;
      onLoadingChange(false);
    }
  }

  function handleFilterChange(
    category: keyof SearchFilters,
    value: string
  ) {

    const index = selectedFilters[category].indexOf(value);
    if (index === -1) {
      selectedFilters[category] = [...selectedFilters[category], value];
    } else {
      selectedFilters[category] = selectedFilters[category].filter((v) => v !== value);
    }

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
      // Start building the target URL based on the *current* browser URL
      const targetUrl = new URL(window.location.href);
      let needsNavigation = false; // Flag to track if goto is needed

      // --- State updates based on query change ---
      if (searchQuery !== lastSearchQuery) {
        if (searchQuery && !lastSearchQuery) {
          // Starting a search: store page, reset to 1
          pageBeforeSearch = currentPage;
          currentPage = 1;
        } else if (!searchQuery && lastSearchQuery) {
          // Clearing a search: restore page
          currentPage = pageBeforeSearch || 1;
          pageBeforeSearch = null;
        }
        lastSearchQuery = searchQuery;
        // Query change implies state change, might need navigation
        needsNavigation = true;
      }

      // --- Update URL parameters based on current state ---

      // 1. Update 'q' parameter
      const currentQ = targetUrl.searchParams.get('q');
      if (searchQuery) {
        if (currentQ !== searchQuery) {
          targetUrl.searchParams.set('q', searchQuery);
          needsNavigation = true;
        }
      } else { // No search query
        if (currentQ !== null) { // Check if 'q' exists
          targetUrl.searchParams.delete('q');
          needsNavigation = true;
        }
      }

      // 2. Update filter parameters
      Object.entries(selectedFilters).forEach(([key, values]) => {
        const currentValuesStr = targetUrl.searchParams.get(key);
        const newValuesStr = values.length > 0 ? values.join(',') : null;

        if (newValuesStr) { // If there are selected values for this filter
          if (currentValuesStr !== newValuesStr) {
            targetUrl.searchParams.set(key, newValuesStr);
            needsNavigation = true;
          }
        } else { // No selected values for this filter
          if (currentValuesStr !== null) { // Check if the parameter exists
            targetUrl.searchParams.delete(key);
            needsNavigation = true;
          }
        }
      });

      // 3. Update page parameter
      const currentPageParam = targetUrl.searchParams.get('page');
      const currentPageInUrl = currentPageParam ? parseInt(currentPageParam, 10) : 1;

      if (currentPage !== 1) { // Target is not page 1
        if (currentPageInUrl !== currentPage) {
           targetUrl.searchParams.set('page', String(currentPage));
           needsNavigation = true;
        }
      } else { // Target is page 1
         if (currentPageInUrl !== 1) {
            targetUrl.searchParams.delete('page');
            needsNavigation = true;
         }
      }

      // --- Perform navigation only if needed ---
      if (needsNavigation) {
         // Double-check: Only navigate if the final target URL string
         // is actually different from the current browser URL string.
         // This prevents unnecessary history entries if changes cancel out.
         if (targetUrl.toString() !== window.location.href) {
            await goto(targetUrl, { keepFocus: true, replaceState: true }); // Use replaceState to avoid excessive history
         }
      }

      // --- Perform the search with the correct page number ---
      await performSearch();
    }, 300); // Keep debounce time
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

  function clearAllFilters() {
    // Reset all filters
    selectedFilters = {
      baseGame: [],
      status: [],
      difficulty: [],
      features: []
    };

    const url = new URL(window.location.href);

    // Remove all filter parameters but keep search query and pagination
    Array.from(url.searchParams.keys())
      .filter(key => Object.keys(selectedFilters).includes(key))
      .forEach(key => url.searchParams.delete(key));

    // Navigate and search (keepFocus maintains user's current input focus)
    goto(url, { keepFocus: true }).then(() => performSearch());
  }
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
      class="overflow-hidden rounded-lg border bg-card p-4 shadow-sm min-h-[100px]"
    >
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-sm font-medium text-muted-foreground">Filters</h3>
        {#if activeFiltersCount > 0}
          <Button
            size="sm"
            on:click={clearAllFilters}
            class="h-7 px-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Clear All ({activeFiltersCount})
          </Button>
        {/if}
      </div>
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
