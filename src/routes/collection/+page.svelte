<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { Button } from '$lib/components/ui/button'
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'
  import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
  import { Separator } from '$lib/components/ui/separator'
  import { Input } from '$lib/components/ui/input'
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs'
  import { ArrowLeft, Gamepad2, Search, Star, BookOpen, Clock, Filter, LayoutGrid, LayoutList } from 'lucide-svelte'
  import CollectionButton from '$lib/components/collection/collection-button.svelte'
  import { browser } from '$app/environment'
  import { onMount } from 'svelte'
  import RomGrid from '$lib/components/rom-grid.svelte'
  import RomListView from '$lib/components/rom-list-view.svelte'
  
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
  
  let filteredCollection = $derived(collection.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.rom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.rom.base_game && item.rom.base_game.some((game: string) => 
        game.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'gba' && item.rom.console === 'GBA') ||
      (activeFilter === 'nds' && item.rom.console === 'NDS') ||
      (activeFilter === 'other' && item.rom.console !== 'GBA' && item.rom.console !== 'NDS');
    
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
</script>

<svelte:head>
  <title>My Collection - PokeROM Codex</title>
  <meta name="description" content="Your personal ROM collection on PokeROM Codex" />
</svelte:head>

<div class="container py-8">
  <div class="mb-8">
    <div class="flex items-center gap-2 mb-2">
      <a href="/private" class="text-muted-foreground hover:text-foreground">
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
          <p class="text-2xl font-bold">{collection.length}</p>
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
                  const consoles = collection.map(item => item.rom.console);
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
              ? new Date(collection[0].added_at).toLocaleDateString('en-US', {
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
        
        {#if filteredCollection.length > 0}
          {#if layoutMode === 'grid'}
            <RomGrid roms={filteredCollection.map(item => item.rom)} />
          {:else}
            <RomListView roms={filteredCollection} />
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
              <Card class="overflow-hidden group hover:border-primary transition-colors">
                <div 
                  class="relative h-40 bg-muted cursor-pointer" 
                  on:click={() => handleRomClick(rom.slug)}
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
                </div>
                
                <CardContent class="p-6">
                  <h3 
                    class="text-lg font-semibold mb-2 cursor-pointer hover:text-primary transition-colors"
                    on:click={() => handleRomClick(rom.slug)}
                  >
                    {rom.name}
                  </h3>
                  
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
                      by {rom.author}
                    </div>
                    
                    <CollectionButton 
                      romId={rom.id} 
                      isInCollection={false} 
                      variant="outline" 
                      size="sm"
                    />
                  </div>
                </CardContent>
              </Card>
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