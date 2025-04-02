import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getRomBySlug } from '$lib/services/rom-service';

export const load: PageServerLoad = async ({ params, locals }) => {
  const rom = await getRomBySlug(params.slug);
  
  if (!rom) {
    throw error(404, { message: 'ROM not found' });
  }
  
  // Check if the ROM is in the user's collection
  let isInCollection = false;
  if (locals.user) {
    const userIds = locals.allUserIds || [locals.user.id];
    
    const { data: collectionItem } = await locals.supabase
      .from('collections')
      .select('id')
      .in('user_id', userIds)
      .eq('rom_id', rom.id)
      .limit(1);
    
    isInCollection = !!collectionItem && collectionItem.length > 0;
  }
  
  // Assign to rom object for use in the UI
  rom.isInCollection = isInCollection;
  
  return {
    rom,
    isInCollection, // Keep this for backward compatibility
    meta: {
      title: `${rom.name} - PokeRomCodex`,
      description: rom.content && rom.content.length > 0 
        ? rom.content.slice(0, 160) 
        : `Download ${rom.name}, a Pokemon ROM hack for ${rom.base_game?.join(', ')}`
    }
  };
};