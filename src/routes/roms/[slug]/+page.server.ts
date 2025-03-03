import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getRomBySlug } from '$lib/services/rom-service';

export const load: PageServerLoad = async ({ params, locals }) => {
  const rom = await getRomBySlug(params.slug);
  
  if (!rom) {
    throw error(404, {
      message: 'ROM hack not found'
    });
  }

  let isInUserCollection = false;
  if (locals.user) {
    const { data, error: collectionError } = await locals.supabase
      .from('collections')
      .select('id')
      .eq('user_id', locals.user.id)
      .eq('rom_id', rom.id)
      .single();

    if (!collectionError && data) {
      isInUserCollection = true;
    }
  }

  // Set the isInCollection property directly on the ROM object
  rom.isInCollection = isInUserCollection;
  
  console.log(`[DEBUG] ROM Detail Page: Loaded rom ${rom.id}, isInCollection=${rom.isInCollection}`);

  return {
    rom,
    isInCollection: isInUserCollection, // Keep this for backward compatibility
    meta: {
      title: `${rom.name} - PokeRomCodex`,
      description: rom.content && rom.content.length > 0 
        ? rom.content[0].substring(0, 160) + '...'
        : `Details about ${rom.name} ROM hack for ${rom.console || 'various consoles'}.`
    }
  };
};