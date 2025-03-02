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

  return {
    rom,
    isInCollection: isInUserCollection,
    meta: {
      title: `${rom.name} - PokeRomCodex`,
      description: rom.content && rom.content.length > 0 
        ? rom.content[0].substring(0, 160) + '...'
        : `Details about ${rom.name} ROM hack for ${rom.console || 'various consoles'}.`
    }
  };
}; 