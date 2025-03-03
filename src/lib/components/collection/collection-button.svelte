<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { collectionStore } from '$lib/stores/collection';
  
  export let romId: number;
  export let isInCollection: boolean;
  export let variant: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive' = 'default';
  export let size: 'default' | 'sm' | 'lg' | 'icon' = 'default';
  export let buttonClass: string = '';
  
  let isLoading = false;
  
  // Check store directly when component is mounted
  onMount(() => {
    const isInStore = $collectionStore.has(romId);
    
    // If the prop and store don't match, prioritize the store value
    if (isInStore !== isInCollection) {
      isInCollection = isInStore;
    }
  });
  
  async function toggleCollection(event: Event) {
    // Stop event propagation to prevent parent click handlers
    event.stopPropagation();
    event.preventDefault();
    
    if (!$page.data.user) {
      toast.error('Please sign in to add ROMs to your collection', {
        description: 'You need to be signed in to manage your collection',
        action: {
          label: 'Sign In',
          onClick: () => window.location.href = '/auth'
        }
      });
      return;
    }
    
    if (isLoading) return;
    
    isLoading = true;
    
    // Double check with the store to ensure we have the latest state
    const currentlyInCollection = $collectionStore.has(romId);
    
    // Always use the store's state to determine which endpoint to use
    const endpoint = currentlyInCollection ? '/api/collection/remove' : '/api/collection/add';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ romId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state based on current operation
        isInCollection = !currentlyInCollection;
        
        // Update the collection store
        if (!currentlyInCollection) {
          collectionStore.add(romId);
        } else {
          collectionStore.remove(romId);
        }
        
        // Invalidate to ensure data is refreshed everywhere
        await invalidate('app:collection');
        
        toast.success(
          !currentlyInCollection ? 'Added to collection' : 'Removed from collection',
          {
            description: !currentlyInCollection 
              ? 'ROM has been added to your collection' 
              : 'ROM has been removed from your collection'
          }
        );
      } else {
        toast.error('Action failed', {
          description: result.error || 'Failed to update collection'
        });
      }
    } catch (error) {
      console.error('Error toggling collection:', error);
      toast.error('Action failed', {
        description: 'An unexpected error occurred'
      });
    } finally {
      isLoading = false;
    }
  }
</script>

<Button 
  {variant} 
  {size} 
  on:click={toggleCollection} 
  disabled={isLoading}
  aria-label={isInCollection ? "Remove from collection" : "Add to collection"}
  title={isInCollection ? "Remove from collection" : "Add to collection"}
  class={`${size === 'icon' ? "h-8 w-8 p-0" : ""} ${buttonClass}`}
  data-rom-id={romId}
  data-in-collection={isInCollection}
>
  {#if isLoading}
    <Loader2 class={size === 'icon' ? "h-4 w-4 animate-spin" : "h-4 w-4 mr-2 animate-spin"} />
    {#if size !== 'icon'}<span>Loading...</span>{/if}
  {:else if isInCollection}
    <BookmarkCheck class={size === 'icon' ? "h-4 w-4" : "h-4 w-4 mr-2"} />
    {#if size !== 'icon'}<span>In Collection</span>{/if}
  {:else}
    <Bookmark class={size === 'icon' ? "h-4 w-4" : "h-4 w-4 mr-2"} />
    {#if size !== 'icon'}<span>Add to Collection</span>{/if}
  {/if}
</Button>