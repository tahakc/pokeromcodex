<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { Button } from '$lib/components/ui/button'
  import { Card, CardContent, CardFooter, CardHeader } from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'
  import { Input } from '$lib/components/ui/input'
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs'
  import { ArrowLeft, Gamepad2, Search, Star, BookOpen, Clock, LayoutGrid, LayoutList } from 'lucide-svelte'
  import CollectionButton from '$lib/components/collection/collection-button.svelte'
  import { browser } from '$app/environment'
  import RomListView from '$lib/components/rom-list-view.svelte'
  import { formatRomAuthors, getOptimizedImageUrl } from '$lib/utils'
  import { collectionStore } from '$lib/stores/collection'

  // Helper function to create URL-friendly slugs
  function slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')      // Replace spaces with -
      .replace(/[^\w\-]+/g, '')  // Remove all non-word chars
      .replace(/\-\-+/g, '-')    // Replace multiple - with single -
      .replace(/^-+/, '')        // Trim - from start of text
      .replace(/-+$/, '');       // Trim - from end of text
  }

  let { data } = $props();

  const user = $page.data.user
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'
  const avatarUrl = user?.user_metadata?.avatar_url

  const collection = data.collection
  const recommendations = data.recommendations

  let searchQuery = $state('')
  let activeFilter = $state('all')
  let layoutMode = $state(browser && localStorage.getItem('layoutMode') ? localStorage.getItem('layoutMode') : 'grid')

  $effect(() => {
    if (browser && layoutMode) {
      localStorage.setItem('layoutMode', layoutMode);
    }
  });

  import type { Rom } from '$lib/types';

  // Ensure the collection data is properly typed as Rom[]
  const typedCollection = collection as Rom[];

  // Create a reactive variable that updates whenever collection, searchQuery, activeFilter, or collectionStore changes
  // Use $derived for runes mode
  let filteredRoms = $derived(typedCollection
    .filter(item => $collectionStore.has(item.id))
    .filter(item => {
      const matchesSearch = searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
  
      const matchesFilter = activeFilter === 'all' ||
        (activeFilter === 'gba' && item.console === 'GBA') ||
        (activeFilter === 'nds' && item.console === 'NDS') ||
        (activeFilter === 'other' && item.console !== 'GBA' && item.console !== 'NDS');
  
      return matchesSearch && matchesFilter;
    }));

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  function handleRomClick(slug: string) {
    goto(`/roms/${slug}`)
  }

  function setFilter(filter: string) {
    activeFilter = filter;
  }

  function toggleLayout() {
    layoutMode = layoutMode === 'grid' ? 'list' : 'grid';
  }

  // Helper function to format dates
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>My Collection - PokeROM Codex</title>
  <meta name="description" content="Your personal ROM collection on PokeROM Codex" />
</svelte:head>

<div class="container py-8">
  <div class="mb-8">
    <div class="flex items-center gap-2 mb-2">
      <a href="/dashboard" class="text-muted-foreground hover:text-foreground">
        <ArrowLeft class="h-4 w-4" />
      </a>
      <h1 class="text-3xl font-bold tracking-tight">My Collection</h1>
    </div>
    <p class="text-muted-foreground max-w-3xl">
      Your personal library of Pokémon ROMs. Browse, organize, and manage your collection.
    </p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <Card>
      <CardContent class="p-6 flex items-center gap-4">
        <div class="bg-primary/10 p-3 rounded-full">
          <BookOpen class="h-6 w-6 text-primary" />
        </div>
        <div>
          <p class="text-sm font-medium text-muted-foreground">Total ROMs</p>
          <p class="text-2xl font-bold">{$collectionStore.size}</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-6 flex items-center gap-4">
        <div class="bg-primary/10 p-3 rounded-full">
          <Gamepad2 class="h-6 w-6 text-primary" />
        </div>
        <div>
          <p class="text-sm font-medium text-muted-foreground">Most Common</p>
          <p class="text-2xl font-bold">
            {collection.length > 0
              ? (() => {
                  const consoles = collection.map(item => item.console);
                  const counts = consoles.reduce<Record<string, number>>((acc, console) => {
                    acc[console] = (acc[console] || 0) + 1;
                    return acc;
                  }, {});
                  const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
                  return mostCommon ? mostCommon[0] : 'N/A';
                })()
              : 'N/A'
            }
          </p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-6 flex items-center gap-4">
        <div class="bg-primary/10 p-3 rounded-full">
          <Clock class="h-6 w-6 text-primary" />
        </div>
        <div>
          <p class="text-sm font-medium text-muted-foreground">Last Added</p>
          <p class="text-2xl font-bold">
            {collection.length > 0
              ? new Date(collection[0].addedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })
              : 'N/A'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  </div>

  <div class="mb-8">
    <Tabs value="collection">
      <TabsList class="w-full">
        <TabsTrigger value="collection" class="flex-1">My Collection</TabsTrigger>
        <TabsTrigger value="recommendations" class="flex-1">Recommendations</TabsTrigger>
      </TabsList>

      <TabsContent value="collection">
        <div class="mt-6 mb-8">
          <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div class="relative w-full md:w-[300px]">
              <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search class="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Search your collection..."
                class="pl-10"
                bind:value={searchQuery}
              />
            </div>

            <div class="flex items-center gap-2">
              <div class="flex items-center mr-2 border rounded-md">
                <Button
                  variant={layoutMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  class="h-9 w-9 rounded-none rounded-l-md"
                  on:click={() => layoutMode = 'grid'}
                  aria-label="Grid layout"
                >
                  <LayoutGrid class="h-4 w-4" />
                </Button>
                <Button
                  variant={layoutMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  class="h-9 w-9 rounded-none rounded-r-md"
                  on:click={() => layoutMode = 'list'}
                  aria-label="List layout"
                >
                  <LayoutList class="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                on:click={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={activeFilter === 'gba' ? 'default' : 'outline'}
                size="sm"
                on:click={() => setFilter('gba')}
              >
                GBA
              </Button>
              <Button
                variant={activeFilter === 'nds' ? 'default' : 'outline'}
                size="sm"
                on:click={() => setFilter('nds')}
              >
                NDS
              </Button>
              <Button
                variant={activeFilter === 'other' ? 'default' : 'outline'}
                size="sm"
                on:click={() => setFilter('other')}
              >
                Other
              </Button>
            </div>
          </div>
        </div>

        {#if filteredRoms.length > 0}
          {#if layoutMode === 'grid'}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {#each filteredRoms as item}
                <div class="h-full">
                  <Card class="h-full flex flex-col hover:shadow-lg transition-shadow">
                    <a href="/roms/{item.slug || slugify(item.name)}">
                      <CardHeader class="p-0">
                        <div class="relative aspect-video w-full overflow-hidden bg-muted">
                          {#if item.image}
                            <img
                              src={getOptimizedImageUrl(item.image, 640)}
                              alt={item.name}
                              class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                              loading="lazy"
                              decoding="async"
                            />
                          {:else}
                            <div class="flex h-full items-center justify-center">
                              <Gamepad2 class="h-12 w-12 text-muted-foreground/50" />
                            </div>
                          {/if}
                        </div>
                      </CardHeader>
                    </a>
                    <CardContent class="p-4 space-y-4 flex-grow">
                      <div>
                        <a href="/roms/{item.slug || slugify(item.name)}" class="block">
                          <h3 class="line-clamp-1 text-lg font-semibold text-card-foreground hover:text-primary transition-colors">{item.name}</h3>
                        </a>
                        <p class="text-sm text-muted-foreground">
                          by {item.author? formatRomAuthors(item.author): 'Unknown'}
                        </p>
                      </div>

                      <div class="flex flex-wrap gap-2">
                        {#if item.console}
                          <Badge variant="outline" class="bg-primary/5">
                            {item.console}
                          </Badge>
                        {/if}
                        {#if item.status && item.status.length > 0}
                          <Badge variant="outline" class="bg-primary/5">
                            {item.status[0]}
                          </Badge>
                        {/if}
                      </div>
                    </CardContent>
                    <CardFooter class="p-4 pt-0 flex items-center justify-between">
                      <div class="text-sm text-muted-foreground">
                        Added: {(item as any).addedAt ? formatDate((item as any).addedAt) : 'Recently'}
                      </div>

                      <CollectionButton
                        romId={item.id}
                        isInCollection={true}
                        variant="ghost"
                        size="icon"
                      />
                    </CardFooter>
                  </Card>
                </div>
            {/each}
          </div>
          {:else}
            <RomListView roms={filteredRoms.map(item => ({...item, isInCollection: true}))} />
          {/if}
        {:else}
          <div class="flex flex-col items-center justify-center py-16 text-center">
            <div class="bg-primary/10 p-6 rounded-full mb-6">
              <Search class="h-10 w-10 text-primary" />
            </div>
            <h3 class="text-xl font-medium mb-2">No ROMs found</h3>
            <p class="text-muted-foreground mb-6 max-w-md">
              {searchQuery
                ? `No ROMs matching "${searchQuery}" found in your collection.`
                : "Your collection is empty for the selected filter."}
            </p>
            <Button on:click={() => goto('/')}>Browse ROMs</Button>
          </div>
        {/if}
      </TabsContent>

      <TabsContent value="recommendations">
        <div class="mt-6 mb-8 flex items-center justify-between">
          <h2 class="text-xl font-semibold">Recommended for You</h2>
          <Button variant="outline" size="sm" on:click={() => goto('/')}>
            Browse All
          </Button>
        </div>

        {#if recommendations.length > 0}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each recommendations as rom}
              <div class="h-full">
                <Card class="overflow-hidden group hover:border-primary transition-colors h-full flex flex-col">
                <button
                  type="button"
                  class="relative h-40 bg-muted cursor-pointer w-full text-left"
                  onclick={() => handleRomClick(rom.slug)}
                  onkeydown={(e) => e.key === 'Enter' && handleRomClick(rom.slug)}
                >
                  {#if rom.image}
                    <img
                      src={rom.image}
                      alt={rom.name}
                      class="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  {:else}
                    <div class="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20">
                      <Gamepad2 class="h-12 w-12 text-primary/40" />
                    </div>
                  {/if}

                  {#if rom.console}
                    <div class="absolute top-3 right-3">
                      <Badge variant="secondary" class="font-medium">
                        {rom.console}
                      </Badge>
                    </div>
                  {/if}
                </button>

                <CardContent class="p-6">
                  <button
                    type="button"
                    class="text-lg font-semibold mb-2 text-left hover:text-primary transition-colors w-full"
                    onclick={() => handleRomClick(rom.slug)}
                    onkeydown={(e) => e.key === 'Enter' && handleRomClick(rom.slug)}
                  >
                    {rom.name}
                  </button>

                  <div class="flex flex-wrap gap-2 mb-4">
                    {#if rom.base_game && rom.base_game.length > 0}
                      <Badge variant="outline">{rom.base_game[0]}</Badge>
                    {/if}

                    {#if rom.status && rom.status.length > 0}
                      <Badge variant="outline" class="bg-primary/5">
                        {rom.status[0]}
                      </Badge>
                    {/if}
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="text-sm text-muted-foreground">
                      by {rom.author? formatRomAuthors(rom.author): 'Unknown'}
                    </div>

                    <CollectionButton
                      romId={rom.id}
                      isInCollection={rom.isInCollection}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                </CardContent>
              </Card>
              </div>
            {/each}
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center py-16 text-center">
            <div class="bg-primary/10 p-6 rounded-full mb-6">
              <Star class="h-10 w-10 text-primary" />
            </div>
            <h3 class="text-xl font-medium mb-2">No recommendations available</h3>
            <p class="text-muted-foreground mb-6 max-w-md">
              We couldn't find any recommendations for you at the moment.
            </p>
            <Button on:click={() => goto('/')}>Browse ROMs</Button>
          </div>
        {/if}
      </TabsContent>
    </Tabs>
  </div>
</div>
