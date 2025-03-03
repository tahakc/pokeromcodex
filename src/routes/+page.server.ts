import type { PageServerLoad } from './$types';
import { getAllRoms } from '$lib/services/rom-service';

// Cache for the initial page load
let initialPageCache: { data: any[], count: number } | null = null;
let initialPageCacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache

export const load: PageServerLoad = async ({ url, locals }) => {
  try {
    const pageParam = url.searchParams.get('page');
    const page = pageParam ? parseInt(pageParam) : 1;
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    
    // Check if we have any search parameters that would require a custom search
    const hasSearchParams = Array.from(url.searchParams.keys()).some(
      key => ['q', 'baseGame', 'status', 'difficulty', 'features'].includes(key)
    );
    
    // Get data either from cache or from search
    let data, count;
    
    // For the initial page load with no filters, use the cache
    if (page === 1 && !hasSearchParams) {
      // Check if we have a valid cache
      if (initialPageCache && (Date.now() - initialPageCacheTime < CACHE_TTL)) {
        console.log('Using server-side cache for faster initial loading');
        data = initialPageCache.data;
        count = initialPageCache.count;
      } else {
        // Perform the search
        const result = await getAllRoms(page, pageSize);
        data = result.data;
        count = result.count;
        
        // Cache the result for the initial page
        initialPageCache = { data, count };
        initialPageCacheTime = Date.now();
      }
    } else {
      // Perform the search for non-cached requests
      const result = await getAllRoms(page, pageSize);
      data = result.data;
      count = result.count;
    }
    
    // If user is logged in, check which ROMs are in their collection
    if (locals.user) {
      // Get user's collection items
      const { data: collectionItems, error } = await locals.supabase
        .from('collections')
        .select('rom_id')
        .eq('user_id', locals.user.id);
      
      if (!error && collectionItems) {
        // Create a set of collection ROM IDs for quick lookup
        const collectionSet = new Set(collectionItems.map(item => item.rom_id));
        
        // Mark each ROM as in the collection or not
        data = data.map(rom => ({
          ...rom,
          isInCollection: collectionSet.has(rom.id)
        }));
        
        console.log(`[DEBUG] Home page: Marked ${collectionItems.length} ROMs as in collection`);
      }
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