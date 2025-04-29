import { supabase } from '$lib/supabase';
import type { Rom, SearchFilters } from '$lib/types';

const TABLE_NAME = 'romslist';

let filterOptionsCache: {
  baseGames: string[];
  statuses: string[];
  difficulties: string[];
  features: string[];
} | null = null;

let allRomsCache: Rom[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const SEARCH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

let searchResultsCache: Map<string, { data: Rom[], count: number, timestamp: number }> = new Map();

let initialPageCache: { data: Rom[], count: number } | null = null;
let initialPageCacheTime = 0;

let requestCache: Map<string, { data: any; timestamp: number }> = new Map();

function clearExpiredCache() {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      requestCache.delete(key);
    }
  }
}

function getCachedData(cacheKey: string) {
  clearExpiredCache();
  const cachedData = requestCache.get(cacheKey);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data;
  }
  return null;
}

function setCachedData(cacheKey: string, data: any) {
  requestCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
}

function formatVersion(version: string): string {
  if (!version) return '';
  return /^\d/.test(version) ? `v${version}` : version;
}

export async function getAllRoms(page = 1, pageSize = 20): Promise<{ data: Rom[], count: number }> {
  // For the initial page load (page 1), use a dedicated cache
  if (page === 1) {
    // Check if we have a valid cache for the initial page
    if (initialPageCache && (Date.now() - initialPageCacheTime < CACHE_TTL)) {
      return initialPageCache;
    }
  }

  // Fetch and cache the initial page data
  const result = await searchRoms('', {
    baseGame: [],
    status: [],
    difficulty: [],
    features: [],
  }, page, pageSize);

  // Only cache page 1 results
  if (page === 1) {
    initialPageCache = result;
    initialPageCacheTime = Date.now();
  }

  return result;
}

export async function getRomById(id: number): Promise<Rom | null> {
  const cacheKey = `getRomById-${id}`;
  const cachedData = getCachedData(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching ROM with ID ${id}:`, error);
    return null;
  }

  const result = {
    ...data,
    version: formatVersion(data.version)
  } as Rom;

  setCachedData(cacheKey, result);

  return result;
}

export async function searchRoms(
  query: string = '',
  filters: SearchFilters = {
    baseGame: [],
    status: [],
    difficulty: [],
    features: [],
  },
  page: number = 1,
  pageSize: number = 20
): Promise<{ data: Rom[]; count: number }> {
  try {
    const cacheKey = JSON.stringify({ query, filters, page, pageSize });

    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const hasNoFilters = Object.values(filters).every(arr => arr.length === 0);
    const hasNoQuery = !query || query.trim() === '';
    const shouldUseAllRomsCache = hasNoFilters && hasNoQuery && allRomsCache && (Date.now() - lastFetchTime < CACHE_TTL);

    if (shouldUseAllRomsCache && page === 1) {
      const result = {
        data: allRomsCache!.slice(0, pageSize),
        count: allRomsCache!.length
      };
      setCachedData(cacheKey, result);
      return result;
    }

    let supabaseQuery = supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact' });

    // Search terms use OR logic internally (name OR author)
    if (query && query.trim() !== '') {
      const searchTerms = query.trim().split(/\s+/).filter(Boolean);

      if (searchTerms.length > 0) {
        searchTerms.forEach(term => {
          const pattern = `%${term}%`;
          supabaseQuery = supabaseQuery.or(
            `name.ilike.${pattern},author.ilike.${pattern}`
          );
        });
      }
    }

    let needsBaseGameFiltering = filters.baseGame && filters.baseGame.length > 0;
    let needsStatusFiltering = filters.status && filters.status.length > 0;

    let needsLocalFiltering =
      (filters.difficulty && filters.difficulty.length > 0) ||
      (filters.features && filters.features.length > 0) ||
      needsBaseGameFiltering ||
      needsStatusFiltering;

    // Increase page size to ensure we have enough data for client-side filtering
    const effectivePageSize = needsLocalFiltering ? pageSize * 5 : pageSize;

    const from = (page - 1) * pageSize;
    const to = from + effectivePageSize - 1;

    const { data, count, error } = await supabaseQuery
      .range(from, to)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching ROMs:', error);
      return { data: [], count: 0 };
    }

    let filteredData = data.map(rom => ({
      ...rom,
      version: formatVersion(rom.version)
    }));

    // Apply base game filter on client side
    if (needsBaseGameFiltering) {
      filteredData = filteredData.filter(rom => {
        const baseGames = rom.base_game || [];
        return filters.baseGame.every(game =>
          baseGames.includes(game)
        );
      });
    }

    // Apply status filter on client side
    if (needsStatusFiltering) {
      filteredData = filteredData.filter(rom => {
        const statuses = rom.status || [];
        return filters.status.every(status =>
          statuses.includes(status)
        );
      });
    }

    if (filters.difficulty && filters.difficulty.length > 0) {
      filteredData = filteredData.filter(rom => {
        const difficultyFeatures = rom.features?.gameplay_difficulty || [];
        return filters.difficulty.every(diff =>
          difficultyFeatures.includes(diff)
        );
      });
    }

    if (filters.features && filters.features.length > 0) {
      filteredData = filteredData.filter(rom => {
        const qolFeatures = rom.features?.qol || [];
        return filters.features.every(feature =>
          qolFeatures.includes(feature)
        );
      });
    }

    if (hasNoFilters && hasNoQuery && page === 1) {
      allRomsCache = filteredData as Rom[];
      lastFetchTime = Date.now();
    }

    const result = {
      data: filteredData.slice(0, pageSize) as Rom[],
      count: needsLocalFiltering ? filteredData.length : (count || 0)
    };

    setCachedData(cacheKey, result);
    return result;

  } catch (error) {
    console.error('Error searching ROMs:', error);
    return { data: [], count: 0 };
  }
}

export async function getFilterOptions(): Promise<{
  baseGames: string[];
  statuses: string[];
  difficulties: string[];
  features: string[];
}> {
  // Use the generic request cache
  const cacheKey = 'filterOptions';
  const cachedData = getCachedData(cacheKey); // Uses requestCache

  if (cachedData) {
    // Check if cached data has the expected structure from the RPC
    // The RPC returns keys like base_games, statuses, etc.
    if (cachedData.base_games && cachedData.statuses && cachedData.difficulties && cachedData.features) {
       // Transform the cached data keys for the return value
       return {
         baseGames: cachedData.base_games,
         statuses: cachedData.statuses,
         difficulties: cachedData.difficulties,
         features: cachedData.features
       };
    } else {
      // Log if cache structure is wrong and proceed to fetch
      console.warn("Cached filter options have incorrect structure from RPC, fetching again.");
      requestCache.delete(cacheKey); // Clear potentially invalid cache
    }
  }

  const { data, error } = await supabase.rpc('get_distinct_filter_options');

  if (error || !data) { // Also check if RPC returned null data
    console.error('Error fetching filter options via RPC:', error);
    return { baseGames: [], statuses: [], difficulties: [], features: [] };
  }

  // Ensure the data structure from RPC is as expected before caching and returning
  // and transform the keys for the return value
  const result = {
      baseGames: data.base_games && Array.isArray(data.base_games) ? data.base_games : [],
      statuses: data.statuses && Array.isArray(data.statuses) ? data.statuses : [],
      difficulties: data.difficulties && Array.isArray(data.difficulties) ? data.difficulties : [],
      features: data.features && Array.isArray(data.features) ? data.features : []
  };

  // Cache the raw result from the RPC function using the generic cache setter
  setCachedData(cacheKey, data);

  return result;
}

export async function getRomBySlug(slug: string): Promise<Rom | null> {
  const cacheKey = `getRomBySlug-${slug}`;
  const cachedData = getCachedData(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching ROM with slug ${slug}:`, error);
    return null;
  }

  const result = {
    ...data,
    version: formatVersion(data.version)
  } as Rom;

  setCachedData(cacheKey, result);

  return result;
}

export async function nameToSlug(name: string): Promise<string> {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

export function getSkeletonImageUrl(): string {
  return '/images/placeholder.png';
}
