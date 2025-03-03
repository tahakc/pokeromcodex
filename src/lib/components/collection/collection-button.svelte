<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  
  export let romId: number;
  export let isInCollection: boolean;
  export let variant: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive' = 'default';
  export let size: 'default' | 'sm' | 'lg' | 'icon' = 'default';
  export let buttonClass: string = '';
  
  let isLoading = false;
  
  async function toggleCollection(event: Event) {
    // Stop event propagation to prevent parent click handlers from firing
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
    
    try {
      const endpoint = isInCollection ? '/api/collection/remove' : '/api/collection/add';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ romId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        isInCollection = !isInCollection;
        toast.success(
          isInCollection ? 'Added to collection' : 'Removed from collection',
          {
            description: isInCollection 
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