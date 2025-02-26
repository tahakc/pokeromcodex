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
const CACHE_TTL = 5 * 60 * 1000; // 5 mins for now idk

let searchResultsCache: Map<string, { data: Rom[], count: number, timestamp: number }> = new Map();
const SEARCH_CACHE_TTL = 2 * 60 * 1000; // 2 minutes cache

const requestCache: Map<string, { data: any; timestamp: number }> = new Map();

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

export async function getAllRoms(page = 1, pageSize = 20): Promise<{ data: Rom[], count: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from(TABLE_NAME)
    .select('*', { count: 'exact' })
    .range(from, to);

  if (error) {
    console.error('Error fetching ROMs:', error);
    return { data: [], count: 0 };
  }

  const formattedData = data.map(rom => ({
    ...rom,
    version: /^\d+/.test(rom.version) ? `v${rom.version}` : rom.version
  }));

  if (page === 1) {
    allRomsCache = formattedData as Rom[];
    lastFetchTime = Date.now();
  }

  return { 
    data: data as Rom[], 
    count: count || 0 
  };
}

export async function getRomById(id: number): Promise<Rom | null> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching ROM with ID ${id}:`, error);
    return null;
  }

  return data as Rom;
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
      console.log('Returning cached results');
      return cachedResult;
    }
    
    console.log('Fetching fresh results from DB');
    
    let supabaseQuery = supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact' });
    
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
    
    if (filters.baseGame && filters.baseGame.length > 0) {
      supabaseQuery = supabaseQuery.overlaps('base_game', filters.baseGame);
    }
    
    if (filters.status && filters.status.length > 0) {
      supabaseQuery = supabaseQuery.in('status', filters.status);
    }
    
    let needsLocalFiltering = 
      (filters.difficulty && filters.difficulty.length > 0) ||
      (filters.features && filters.features.length > 0);
    
    const effectivePageSize = needsLocalFiltering ? pageSize * 3 : pageSize;
    
    const from = (page - 1) * pageSize;
    const to = from + effectivePageSize - 1;
    
    const { data, count, error } = await supabaseQuery
      .range(from, to)
      .order('date_updated', { ascending: false });
      
    if (error) {
      console.error('Error fetching ROMs:', error);
      return { data: [], count: 0 };
    }
    
    let filteredData = [...data];
    
    if (filters.difficulty && filters.difficulty.length > 0) {
      filteredData = filteredData.filter(rom => {
        const difficultyFeatures = rom.features?.gameplay_difficulty || [];
        return filters.difficulty.some(diff => 
          difficultyFeatures.includes(diff)
        );
      });
    }
    
    if (filters.features && filters.features.length > 0) {
      filteredData = filteredData.filter(rom => {
        const allFeatures = Object.values(rom.features || {}).flat();
        return filters.features.some(feature => 
          allFeatures.includes(feature)
        );
      });
    }
    
    const paginatedData = filteredData.slice(0, pageSize);
    
    const totalCount = count || 0;
    const filterRatio = data.length > 0 ? filteredData.length / data.length : 1;
    const estimatedTotalCount = Math.round(totalCount * filterRatio);
    
    const result = { 
      data: paginatedData, 
      count: estimatedTotalCount 
    };
    
    setCachedData(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error in searchRoms:', error);
    return { data: [], count: 0 };
  }
}

export function clearSearchCache(): void {
  searchResultsCache.clear();
}

export async function getFilterOptions(): Promise<{
  baseGames: string[];
  statuses: string[];
  difficulties: string[];
  features: string[];
}> {
  if (filterOptionsCache) {
    return filterOptionsCache;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('base_game, status, features');

  if (error) {
    console.error('Error fetching filter options:', error);
    return { baseGames: [], statuses: [], difficulties: [], features: [] };
  }

  const baseGames = new Set<string>();
  const statuses = new Set<string>();
  const difficulties = new Set<string>();
  const features = new Set<string>();

  data.forEach(rom => {
    if (rom.base_game && Array.isArray(rom.base_game)) {
      rom.base_game.forEach((game: string) => baseGames.add(game));
    }

    if (rom.status && Array.isArray(rom.status)) {
      rom.status.forEach((status: string) => statuses.add(status));
    }

    if (rom.features) {
      if (rom.features.gameplay_difficulty && Array.isArray(rom.features.gameplay_difficulty)) {
        rom.features.gameplay_difficulty.forEach((diff: string) => difficulties.add(diff));
      }

      if (rom.features.qol && Array.isArray(rom.features.qol)) {
        rom.features.qol.forEach((qol: string) => features.add(qol));
      }
    }
  });

  filterOptionsCache = {
    baseGames: Array.from(baseGames),
    statuses: Array.from(statuses),
    difficulties: Array.from(difficulties),
    features: Array.from(features)
  };

  return filterOptionsCache;
}

export async function getRomBySlug(slug: string): Promise<Rom | null> {
  if (allRomsCache && Date.now() - lastFetchTime < CACHE_TTL) {
    const rom = allRomsCache.find(rom => nameToSlug(rom.name) === slug);
    if (rom) return rom;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*');

  if (error || !data) {
    console.error(`Error fetching ROMs:`, error);
    return null;
  }

  allRomsCache = data as Rom[];
  lastFetchTime = Date.now();

  const rom = data.find(rom => nameToSlug(rom.name) === slug);
  
  if (!rom) {
    console.error(`No ROM found with slug ${slug}`);
    return null;
  }

  rom.version = /^\d+/.test(rom.version) ? `v${rom.version}` : rom.version

  return rom as Rom;
}

export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function getSkeletonImageUrl(): string {
  return '/images/rom-skeleton.svg';
} 