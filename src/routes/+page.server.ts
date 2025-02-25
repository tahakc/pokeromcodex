import type { PageServerLoad } from './$types';
import { getAllRoms, nameToSlug } from '$lib/services/rom-service';

export const load: PageServerLoad = async ({ url }) => {
  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    
    const { data, count } = await getAllRoms(page, pageSize);
    
    const roms = data?.map(rom => ({
      ...rom,
      slug: nameToSlug(rom.name)
    })) || [];
    
    return {
      roms,
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