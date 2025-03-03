<script lang="ts">
  import { format, parse } from "date-fns";
  import type { Rom } from "$lib/types";
  import { Card, CardContent, CardFooter, CardHeader } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { cn, formatRomAuthors, getOptimizedImageUrl } from "$lib/utils";
  import { Gamepad2, Star, Sparkles } from "lucide-svelte";
  import CollectionButton from "$lib/components/collection/collection-button.svelte";
  import { onMount } from "svelte";

  export let rom: Rom & { slug: string; isLoading?: boolean; isInCollection?: boolean };
  export let displayRoms: (Rom & { slug: string; isLoading?: boolean })[] = [];

  $: formattedDate = rom.date_updated && !rom.isLoading
    ? format(parse(rom.date_updated, "yyyy/MM/dd", new Date()), "MMM d, yyyy")
    : "Date unknown";
    
  $: difficultyLevels = rom?.features?.gameplay_difficulty || [];
  
  // Track image loading state
  let imageLoaded = false;
  
  function handleImageLoaded() {
    imageLoaded = true;
  }
  
  // Reset loading state when rom changes
  $: if (rom) {
    imageLoaded = false;
  }
</script>

<div class="group block">
  {#if rom.isLoading}
  <Card class="overflow-hidden transition-all duration-300 animate-pulse h-full flex flex-col">
    <CardHeader class="p-0">
      <div class="relative aspect-video w-full overflow-hidden bg-muted">
        <div class="absolute inset-0 bg-muted"></div>
      </div>
    </CardHeader>
    <CardContent class="space-y-2.5 p-4 flex-grow">
      <div class="space-y-1.5">
        <div class="h-6 w-3/4 rounded bg-muted"></div>
        <div class="h-4 w-1/2 rounded bg-muted"></div>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <div class="h-6 w-20 rounded bg-muted"></div>
        <div class="h-6 w-24 rounded bg-muted"></div>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <div class="h-6 w-28 rounded bg-muted"></div>
      </div>
    </CardContent>
    <CardFooter class="p-4 pt-0">
      <div class="h-4 w-32 rounded bg-muted"></div>
    </CardFooter>
  </Card>
  {:else}
  <Card class="overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-primary/10 h-full flex flex-col">
    <a href="/roms/{rom.slug}" class="block">
      <CardHeader class="p-0">
        <div class="relative aspect-video w-full overflow-hidden bg-muted">
          {#if rom.image}
            <!-- Loading spinner that shows while image is loading -->
            {#if !imageLoaded}
              <div class="absolute inset-0 flex items-center justify-center z-10 bg-muted">
                <div class="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
              </div>
            {/if}
            
            <img
              src={getOptimizedImageUrl(rom.image, 768)}
              alt={rom.name}
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading={rom.slug === displayRoms[0]?.slug || rom.slug === displayRoms[1]?.slug || rom.slug === displayRoms[2]?.slug || rom.slug === displayRoms[3]?.slug ? "eager" : "lazy"}
              decoding={rom.slug === displayRoms[0]?.slug || rom.slug === displayRoms[1]?.slug ? "sync" : "async"}
              srcset={`${getOptimizedImageUrl(rom.image, 384)} 384w,
                      ${getOptimizedImageUrl(rom.image, 640)} 640w,
                      ${getOptimizedImageUrl(rom.image, 768)} 768w,
                      ${getOptimizedImageUrl(rom.image, 1024)} 1024w`}
              sizes="(max-width: 640px) 100vw,
                     (max-width: 768px) 50vw,
                     (max-width: 1024px) 33vw,
                     25vw"
              fetchpriority={rom.slug === displayRoms[0]?.slug || rom.slug === displayRoms[1]?.slug ? "high" : "auto"}
              on:load={handleImageLoaded}
            />
          {:else}
            <div class="flex h-full items-center justify-center">
              <Gamepad2 class="h-12 w-12 text-muted-foreground/50" />
            </div>
          {/if}
          {#if rom.version}
            <Badge
              variant="secondary"
              class="absolute right-2 top-2 bg-background/80 backdrop-blur"
            >
              {rom.version}
            </Badge>
          {/if}
        </div>
      </CardHeader>
    </a>
    <CardContent class="space-y-2.5 p-4 flex-grow">
      <div class="space-y-1.5">
        <div class="flex items-center">
          <a href="/roms/{rom.slug}" class="flex-grow min-w-0 pr-2 max-w-[85%]">
            <h3 class="truncate text-lg font-semibold tracking-tight group-hover:text-primary" title={rom.name}>
              {rom.name}
            </h3>
          </a>
          <CollectionButton 
            romId={rom.id} 
            isInCollection={rom.isInCollection === true} 
            variant="ghost" 
            size="icon"
            buttonClass="ml-auto"
          />
        </div>
        <p class="line-clamp-1 text-sm text-muted-foreground">
          by {rom.author? formatRomAuthors(rom.author): 'Unknown'}
        </p>
      </div>
      <div class="flex flex-wrap gap-1.5">
        {#if rom.base_game && rom.base_game.length > 0}
          {#each rom.base_game.slice(0, 2) as game}
            <Badge
              variant="outline"
              class={cn(
                "transition-colors",
                "group-hover:border-primary/50 group-hover:bg-primary/5"
              )}
            >
              <Star class="mr-1 h-3 w-3 text-amber-500" />
              {game}
            </Badge>
          {/each}
          {#if rom.base_game.length > 2}
            <Badge variant="outline" class="group-hover:border-primary/50">
              +{rom.base_game.length - 2} more
            </Badge>
          {/if}
        {/if}
      </div>
      <div class="flex flex-wrap gap-1.5">
        {#if difficultyLevels.length > 0}
          {#each difficultyLevels.slice(0, 2) as difficulty}
            <Badge
              variant="secondary"
              class="group-hover:bg-secondary/80"
            >
              <Gamepad2 class="mr-1 h-3 w-3" />
              {difficulty}
            </Badge>
          {/each}
          {#if difficultyLevels.length > 2}
            <Badge variant="secondary" class="group-hover:bg-secondary/80">
              +{difficultyLevels.length - 2} more
            </Badge>
          {/if}
        {/if}
      </div>
    </CardContent>
    <CardFooter class="p-4 pt-0 mt-auto">
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles class="h-3 w-3" />
        <span>Updated {formattedDate}</span>
      </div>
    </CardFooter>
  </Card>
  {/if}
</div>