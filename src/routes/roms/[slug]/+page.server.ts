import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getRomBySlug } from '$lib/services/rom-service';

export const load: PageServerLoad = async ({ params }) => {
  const rom = await getRomBySlug(params.slug);
  
  if (!rom) {
    throw error(404, {
      message: 'ROM hack not found'
    });
  }

  return {
    rom,
    meta: {
      title: `${rom.name} - PokeRomCodex`,
      description: rom.content && rom.content.length > 0 
        ? rom.content[0].substring(0, 160) + '...'
        : `Details about ${rom.name} ROM hack for ${rom.console || 'various consoles'}.`
    }
  };
}; 