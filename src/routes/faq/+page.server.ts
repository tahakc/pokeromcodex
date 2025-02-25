import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    meta: {
      title: 'FAQ - PokeRomCodex',
      description: 'Frequently asked questions about Pokémon ROM hacks and using PokeRomCodex'
    }
  };
}; 