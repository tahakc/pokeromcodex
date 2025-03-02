<script lang="ts">
  import { page } from '$app/stores'
  import { Button } from '$lib/components/ui/button'
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'
  import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
  import { Separator } from '$lib/components/ui/separator'
  import { goto } from '$app/navigation'
  
  import { LayoutGrid, Activity, Users, Star, Clock, Settings, Gamepad2 } from 'lucide-svelte'
  
  export let data
  
  const user = $page.data.user
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'
  const avatarUrl = user?.user_metadata?.avatar_url
  
  const collection = data.collection
  const collectionCount = data.collectionCount
  
  function getInitials(name: string) {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  function handleProfileClick() {
    goto('/profile')
  }
  
  function handleRomClick(slug: string) {
    goto(`/roms/${slug}`)
  }
  
  function handleViewAllCollection() {
    goto('/collection')
  }
  
  const stats = [
    { label: 'ROMs Collected', value: collectionCount.toString(), icon: LayoutGrid },
    { label: 'Recent Activity', value: '0', icon: Activity },
    { label: 'Community Rank', value: 'Novice', icon: Users }
  ]
  
  const recentActivity = []
  const recommendations = [
    { title: 'Pokémon Emerald', type: 'GBA', category: 'Official' },
    { title: 'Pokémon Radical Red', type: 'GBA', category: 'Hack' },
    { title: 'Pokémon Unbound', type: 'GBA', category: 'Hack' }
  ]
</script>

<svelte:head>
  <title>Dashboard - PokeROM Codex</title>
  <meta name="description" content="Your personal dashboard on PokeROM Codex" />
</svelte:head>

<div class="container py-8 space-y-8">
  <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div class="flex items-center gap-4">
      <Avatar class="h-16 w-16 border-2 border-primary">
        {#if avatarUrl}
          <AvatarImage src={avatarUrl} alt={name} />
        {/if}
        <AvatarFallback class="text-lg bg-primary text-primary-foreground">{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Welcome, {name}</h1>
        <p class="text-muted-foreground">Your personal dashboard on PokeROM Codex</p>
      </div>
    </div>
    <div class="flex gap-2">
      <Button variant="outline" on:click={handleProfileClick}>
        <Settings class="mr-2 h-4 w-4" />
        Profile Settings
      </Button>
    </div>
  </div>
  
  <div class="grid gap-4 md:grid-cols-3">
    {#each stats as stat}
      <Card>
        <CardContent class="p-6 flex items-center gap-4">
          <div class="bg-primary/10 p-3 rounded-full">
            <svelte:component this={stat.icon} class="h-6 w-6 text-primary" />
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p class="text-2xl font-bold">{stat.value}</p>
          </div>
        </CardContent>
      </Card>
    {/each}
  </div>
  
  <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    <Card class="md:col-span-2 lg:col-span-1">
      <CardHeader class="pb-3">
        <div class="flex items-center justify-between">
          <CardTitle class="text-lg font-medium">Your Collection</CardTitle>
          <Star class="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Manage your ROM collection</CardDescription>
      </CardHeader>
      <CardContent class="pb-2">
        {#if collection && collection.length > 0}
          <div class="grid grid-cols-1 gap-3">
            {#each collection.slice(0, 3) as item}
              <div class="flex items-center gap-3 group cursor-pointer" on:click={() => handleRomClick(item.rom.slug)}>
                <div class="relative h-12 w-12 overflow-hidden rounded bg-muted">
                  {#if item.rom.image}
                    <img src={item.rom.image} alt={item.rom.name} class="h-full w-full object-cover" />
                  {:else}
                    <div class="flex h-full items-center justify-center">
                      <Gamepad2 class="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  {/if}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium truncate group-hover:text-primary">{item.rom.name}</p>
                  <div class="flex items-center gap-2 mt-1">
                    {#if item.rom.console}
                      <Badge variant="outline" class="text-xs">{item.rom.console}</Badge>
                    {/if}
                    {#if item.rom.base_game && item.rom.base_game.length > 0}
                      <Badge variant="secondary" class="text-xs">{item.rom.base_game[0]}</Badge>
                    {/if}
                  </div>
                </div>
              </div>
              {#if collection.indexOf(item) < Math.min(2, collection.length - 1)}
                <Separator />
              {/if}
            {/each}
          </div>
          {#if collection.length > 3}
            <div class="mt-4">
              <Button variant="link" class="w-full p-0 h-auto text-primary" on:click={handleViewAllCollection}>
                See all {collectionCount} ROMs
              </Button>
            </div>
          {/if}
        {:else}
          <div class="flex flex-col items-center justify-center py-8 text-center">
            <div class="bg-primary/10 p-3 rounded-full mb-4">
              <LayoutGrid class="h-8 w-8 text-primary" />
            </div>
            <h3 class="text-lg font-medium mb-1">No ROMs in collection</h3>
            <p class="text-sm text-muted-foreground mb-4">Start building your collection by browsing our ROM library.</p>
          </div>
        {/if}
      </CardContent>
      <CardFooter>
        <div class="flex w-full gap-2">
          <Button variant="outline" class="flex-1" on:click={() => goto('/')}>Browse ROMs</Button>
          {#if collection && collection.length > 0}
            <Button variant="default" class="flex-1" on:click={handleViewAllCollection}>View Collection</Button>
          {/if}
        </div>
      </CardFooter>
    </Card>
    
    <Card>
      <CardHeader class="pb-3">
        <div class="flex items-center justify-between">
          <CardTitle class="text-lg font-medium">Recent Activity</CardTitle>
          <Clock class="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Your latest actions</CardDescription>
      </CardHeader>
      <CardContent>
        {#if recentActivity.length > 0}
          <div class="space-y-4">
            <!-- Activity placeholder -->
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center py-8 text-center">
            <div class="bg-primary/10 p-3 rounded-full mb-4">
              <Activity class="h-6 w-6 text-primary" />
            </div>
            <p class="text-sm text-muted-foreground">No recent activity to display.</p>
          </div>
        {/if}
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader class="pb-3">
        <div class="flex items-center justify-between">
          <CardTitle class="text-lg font-medium">Recommended ROMs</CardTitle>
          <Star class="h-4 w-4 text-yellow-500" />
        </div>
        <CardDescription>Popular ROMs you might enjoy</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          {#each recommendations as rom, i}
            {#if i > 0}
              <Separator />
            {/if}
            <div class="flex items-center justify-between pt-2">
              <div>
                <p class="font-medium">{rom.title}</p>
                <div class="flex items-center gap-2 mt-1">
                  <Badge variant="outline" class="text-xs">{rom.type}</Badge>
                  <Badge variant="secondary" class="text-xs">{rom.category}</Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                <Star class="h-4 w-4" />
              </Button>
            </div>
          {/each}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" class="w-full">View More</Button>
      </CardFooter>
    </Card>
  </div>
  
  <Card>
    <CardHeader>
      <CardTitle>Community Updates</CardTitle>
      <CardDescription>Latest news and updates from the PokeROM Codex community</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="bg-primary/5 rounded-lg p-6 text-center">
        <h3 class="text-lg font-medium mb-2">Join Our Discord Community</h3>
        <p class="text-muted-foreground mb-4">Connect with other Pokémon ROM enthusiasts, share tips, and stay updated.</p>
        <Button variant="default">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M18 4a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3Z"></path><path d="M6 4a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3Z"></path><path d="M18 7v10c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V7"></path><path d="M18 10a6 6 0 0 1-12 0"></path></svg>
          Join Discord
        </Button>
      </div>
    </CardContent>
  </Card>
</div> 