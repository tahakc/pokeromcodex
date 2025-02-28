<script lang="ts">
  import { format, parse } from "date-fns";
  import type { Rom } from "$lib/types";
  import { Card, CardContent, CardFooter, CardHeader } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { cn, optimizeImage } from "$lib/utils";
  import { Gamepad2, Star, Sparkles } from "lucide-svelte";
  import { browser } from "$app/environment";

  export let rom: Rom & { slug: string; isLoading?: boolean };
  export let displayRoms: (Rom & { slug: string; isLoading?: boolean })[] = [];

  $: formattedDate = rom.date_updated && !rom.isLoading
    ? format(parse(rom.date_updated, "yyyy/MM/dd", new Date()), "MMM d, yyyy")
    : "Date unknown";
    
  $: difficultyLevels = rom?.features?.gameplay_difficulty || [];
  
  // Check if we're on mobile
  let isMobile = false;
  if (browser) {
    isMobile = window.innerWidth < 640;
  }
  
  // Optimize image URLs with different sizes based on position and device
  $: optimizedImage = rom.image 
    ? optimizeImage(rom.image, {
        width: isMobile ? 640 : (rom.slug === displayRoms[0]?.slug ? 1024 : 768),
        quality: isMobile ? 75 : 85,
        isMobile
      }) 
    : '';
</script>

<div class="group block">
  {#if rom.isLoading}
  <Card class="overflow-hidden transition-all duration-300 animate-pulse">
    <CardHeader class="p-0">
      <div class="relative aspect-video w-full overflow-hidden bg-muted">
        <div class="absolute inset-0 bg-muted"></div>
      </div>
    </CardHeader>
    <CardContent class="space-y-2.5 p-4">
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
  <a href="/roms/{rom.slug}">
    <Card class="overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-primary/10">
      <CardHeader class="p-0">
        <div class="relative aspect-video w-full overflow-hidden bg-muted">
          {#if rom.image}
            {#if rom.slug === displayRoms[0]?.slug}
              <!-- First image - optimized for fastest loading -->
              <img
                src={optimizedImage}
                alt={rom.name}
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="eager"
                decoding="sync"
                fetchpriority="high"
                style="will-change: transform; content-visibility: auto;"
              />
            {:else}
              <!-- Other images - regular loading strategy -->
              <img
                src={optimizedImage}
                alt={rom.name}
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading={rom.slug === displayRoms[1]?.slug || rom.slug === displayRoms[2]?.slug || rom.slug === displayRoms[3]?.slug ? "eager" : "lazy"}
                decoding={rom.slug === displayRoms[1]?.slug ? "sync" : "async"}
                fetchpriority={rom.slug === displayRoms[1]?.slug ? "high" : "auto"}
                style="will-change: transform; content-visibility: auto;"
              />
            {/if}
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
      <CardContent class="space-y-2.5 p-4">
        <div class="space-y-1.5">
          <h3 class="line-clamp-1 text-lg font-semibold tracking-tight group-hover:text-primary">
            {rom.name}
          </h3>
          <p class="line-clamp-1 text-sm text-muted-foreground">
            by {rom.author || 'Unknown'}
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
      <CardFooter class="p-4 pt-0">
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles class="h-3 w-3" />
          <span>Updated {formattedDate}</span>
        </div>
      </CardFooter>
    </Card>
  </a>
  {/if}
</div> 