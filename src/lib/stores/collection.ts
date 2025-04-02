import { writable, get } from 'svelte/store';
import { invalidate } from '$app/navigation';

// Create a set to track ROM IDs in the collection
const createCollectionStore = () => {
  const store = writable<Set<number>>(new Set());
  const { subscribe, update, set } = store;

  return {
    subscribe,
    initialize: (collectionIds: number[]) => {
      set(new Set(collectionIds));
    },
    add: async (romId: number) => {
      update(collection => {
        collection.add(romId);
        return collection;
      });
      // Single invalidation key affecting all components
      await invalidate('app:collection');
    },
    remove: async (romId: number) => {
      update(collection => {
        collection.delete(romId);
        return collection;
      });
      // Single invalidation key affecting all components
      await invalidate('app:collection');
    },
    has: (romId: number) => {
      // Directly access the store value to check if it contains the ROM ID
      const collection = get(store);
      return collection.has(romId);
    }
  };
};

export const collectionStore = createCollectionStore();
