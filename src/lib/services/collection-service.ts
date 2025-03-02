import { supabase } from '$lib/supabase';
import type { Rom } from '$lib/types';

const TABLE_NAME = 'collections';

export interface Collection {
  id: string;
  user_id: string;
  rom_id: number;
  added_at: string;
  notes?: string;
}

export interface CollectionWithRom extends Collection {
  rom: Rom;
}
export async function addToCollection(userId: string, romId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .insert({
        user_id: userId,
        rom_id: romId
      });

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'This ROM is already in your collection' };
      }
      console.error('Error adding ROM to collection:', error);
      return { success: false, error: 'Failed to add ROM to collection' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding ROM to collection:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
export async function removeFromCollection(userId: string, romId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('user_id', userId)
      .eq('rom_id', romId);

    if (error) {
      console.error('Error removing ROM from collection:', error);
      return { success: false, error: 'Failed to remove ROM from collection' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing ROM from collection:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
export async function isInCollection(userId: string, romId: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('id')
      .eq('user_id', userId)
      .eq('rom_id', romId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking if ROM is in collection:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking if ROM is in collection:', error);
    return false;
  }
}
export async function getUserCollection(userId: string): Promise<CollectionWithRom[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        rom:romslist(*)
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching user collection:', error);
      return [];
    }

    return data.map(item => ({
      ...item,
      rom: item.rom as Rom
    }));
  } catch (error) {
    console.error('Error fetching user collection:', error);
    return [];
  }
}
export async function getUserCollectionCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from(TABLE_NAME)
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user collection count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error fetching user collection count:', error);
    return 0;
  }
}
export async function updateCollectionNotes(userId: string, romId: number, notes: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ notes })
      .eq('user_id', userId)
      .eq('rom_id', romId);

    if (error) {
      console.error('Error updating collection notes:', error);
      return { success: false, error: 'Failed to update notes' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating collection notes:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
} 