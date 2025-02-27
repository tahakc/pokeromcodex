import type { PageServerLoad } from './$types';
import { getAllRoms } from '$lib/services/rom-service';

// Cache for the initial page load
let initialPageCache: { data: any[], count: number } | null = null;
let initialPageCacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache

export const load: PageServerLoad = async ({ url }) => {
  try {
    const pageParam = url.searchParams.get('page');
    const page = pageParam ? parseInt(pageParam) : 1;
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    
    // Check if we have any search parameters that would require a custom search
    const hasSearchParams = Array.from(url.searchParams.keys()).some(
      key => ['q', 'baseGame', 'status', 'difficulty', 'features'].includes(key)
    );
    
    // For the initial page load with no filters, use the cache
    if (page === 1 && !hasSearchParams) {
      // Check if we have a valid cache
      if (initialPageCache && (Date.now() - initialPageCacheTime < CACHE_TTL)) {
        console.log('Using server-side cache for faster initial loading');
        return {
          roms: initialPageCache.data,
          count: initialPageCache.count,
          page,
          pageSize,
          meta: {
            title: 'PokeRomCodex - Discover the Best Pokémon ROM Hacks',
            description: 'Explore a curated collection of the best Pokémon ROM hacks. Find detailed information, features, and download links for enhanced Pokémon adventures.'
          }
        };
      }
    }
    
    // Perform the search
    const { data, count } = await getAllRoms(page, pageSize);
    
    // Cache the result for the initial page
    if (page === 1 && !hasSearchParams) {
      initialPageCache = { data, count };
      initialPageCacheTime = Date.now();
    }
    
    return {
      roms: data,
      count,
      page,
      pageSize,
      meta: {
        title: 'PokeRomCodex - Discover the Best Pokémon ROM Hacks',
        description: 'Explore a curated collection of the best Pokémon ROM hacks. Find detailed information, features, and download links for enhanced Pokémon adventures.'
      }
    };
  } catch (error) {
    console.error('Error loading ROMs:', error);
    return {
      roms: [],
      count: 0,
      page: 1,
      pageSize: 20,
      error: true,
      meta: {
        title: 'PokeRomCodex - Discover the Best Pokémon ROM Hacks',
        description: 'Explore a curated collection of the best Pokémon ROM hacks. Find detailed information, features, and download links for enhanced Pokémon adventures.'
      }
    };
  }
}; 