<script lang="ts">
  import { format, parse } from "date-fns";
  import type { Rom } from "$lib/types";
  import { Card } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { cn, formatRomAuthors } from "$lib/utils";
  import { getImageDimensions, getResponsiveImageProps } from "$lib/responsive-image";
  import { Gamepad2, Star, Sparkles, Calendar } from "lucide-svelte";
  import CollectionButton from "$lib/components/collection/collection-button.svelte";

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
  
  // Function to strip markdown and HTML tags from content
  function stripMarkdown(text: string): string {
    if (!text) return '';
    
    try {
      // Simple regex-based approach to strip markdown
      // Remove headers
      let plainText = text.replace(/#{1,6}\s?/g, '');
      // Remove emphasis (bold, italic)
      plainText = plainText.replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1');
      // Remove links
      plainText = plainText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      // Remove code blocks and inline code
      plainText = plainText.replace(/`{1,3}[^`]*`{1,3}/g, '');
      // Remove blockquotes
      plainText = plainText.replace(/^\s*>\s+/gm, '');
      // Remove horizontal rules
      plainText = plainText.replace(/^\s*[-*_]{3,}\s*$/gm, '');
      // Remove list markers
      plainText = plainText.replace(/^\s*[-*+]\s+/gm, '');
      plainText = plainText.replace(/^\s*\d+\.\s+/gm, '');
      
      return plainText.trim();
    } catch (e) {
      // Fallback to just returning the original text if something goes wrong
      console.error('Error stripping markdown:', e);
      return text;
    }
  }
  
  // Process content only when it exists
  $: cleanContent = rom.content && rom.content.length > 0 
    ? rom.content.map(item => stripMarkdown(item || '')).join(' ')
    : '';
</script>

<div class="group block">
  {#if rom.isLoading}
  <Card class="overflow-hidden transition-all duration-300 animate-pulse">
    <div class="flex flex-col md:flex-row">
      <div class="md:w-1/4 lg:w-1/5">
        <div class="relative aspect-video md:aspect-square w-full overflow-hidden bg-muted">
          <div class="absolute inset-0 bg-muted"></div>
        </div>
      </div>
      <div class="flex-1 p-4">
        <div class="space-y-2.5">
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
          <div class="h-4 w-32 rounded bg-muted"></div>
        </div>
      </div>
    </div>
  </Card>
  {:else}
  <Card class="overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-primary/10">
    <div class="flex flex-col md:flex-row">
      <div class="md:w-1/4 lg:w-1/5">
        <div class="relative aspect-video md:aspect-square w-full overflow-hidden bg-muted">
          <a href="/roms/{rom.slug}" class="block h-full w-full">
            {#if rom.image}
              <!-- Loading spinner that shows while image is loading -->
              {#if !imageLoaded}
                <div class="absolute inset-0 flex items-center justify-center z-10 bg-muted">
                  <div class="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                </div>
              {/if}
              
              {@const imageDims = getImageDimensions()}
              {@const imageProps = getResponsiveImageProps(rom.image, 0)}
              <img
                src={imageProps.src}
                alt={rom.name}
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading={rom.slug === displayRoms[0]?.slug || rom.slug === displayRoms[1]?.slug ? "eager" : "lazy"}
                decoding={rom.slug === displayRoms[0]?.slug ? "sync" : "async"}
                width={imageDims.width}
                height={imageDims.height}
                sizes={imageProps.sizes}
                fetchpriority={rom.slug === displayRoms[0]?.slug ? "high" : "auto"}
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
          </a>
        </div>
      </div>
      
      <div class="flex-1 p-4">
        <div class="space-y-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2 justify-between">
              <a href="/roms/{rom.slug}" class="block">
                <h3 class="text-lg font-semibold tracking-tight group-hover:text-primary">
                  {rom.name}
                </h3>
              </a>
              <CollectionButton 
                romId={rom.id} 
                isInCollection={rom.isInCollection === true} 
                variant="outline" 
                size="sm"
              />
            </div>
            <p class="text-sm text-muted-foreground">
              by {rom.author? formatRomAuthors(rom.author): 'Unknown'}
            </p>
          </div>
          
          <div class="flex flex-wrap gap-1.5">
            {#if rom.base_game && rom.base_game.length > 0}
              {#each rom.base_game as game}
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
            {/if}
          </div>
          
          <div class="flex flex-wrap gap-1.5">
            {#if difficultyLevels.length > 0}
              {#each difficultyLevels as difficulty}
                <Badge
                  variant="secondary"
                  class="group-hover:bg-secondary/80"
                >
                  <Gamepad2 class="mr-1 h-3 w-3" />
                  {difficulty}
                </Badge>
              {/each}
            {/if}
          </div>
          
          {#if rom.content && rom.content.length > 0}
            <p class="text-sm text-muted-foreground line-clamp-2 mt-2 whitespace-normal">
              {cleanContent}
            </p>
          {/if}
          
          <div class="flex items-center justify-between mt-2">
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar class="h-3 w-3" />
              <span>Updated {formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Card>
  {/if}
</div>
