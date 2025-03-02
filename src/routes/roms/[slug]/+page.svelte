<script lang="ts">
  import { page } from "$app/stores";
  import { browser } from "$app/environment";
  import type { Rom } from "$lib/types";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent } from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import { fade } from "svelte/transition";
  import { format, parse } from "date-fns";
  import { ArrowLeft, ExternalLink, Gamepad2, Star } from "lucide-svelte";
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';
  import SeoHead from "$lib/components/seo/seo-head.svelte";
  import CollectionButton from "$lib/components/collection/collection-button.svelte";

  export let data;
  const rom: Rom = data.rom;
  const isInCollection = data.isInCollection;

  $: formattedDate = rom?.date_updated
    ? format(parse(rom.date_updated, "yyyy/MM/dd", new Date()), "MMMM d, yyyy")
    : "Date unknown";

  $: mainLink = rom?.links && rom.links.length > 0 ? rom.links[0] : null;

  $: difficultyLevels = rom?.features?.gameplay_difficulty || [];

  $: qolFeatures = rom?.features?.qol || [];
  
  marked.setOptions({
    breaks: true,
    gfm: true
  });
  
  function renderMarkdown(content: string) {
    const html = marked(content) as string;
    // Only use DOMPurify in the browser, pass through on server
    return browser ? DOMPurify.sanitize(html) : html;
  }
</script>

<SeoHead 
  title={data.meta.title}
  description={data.meta.description}
  rom={rom}
/>

<svelte:head>
  <style>
    /* Fix for mobile overflow issues */
    .prose {
      max-width: 100%;
      overflow-wrap: break-word;
      word-wrap: break-word;
      word-break: break-word;
      hyphens: auto;
    }
    
    .prose pre {
      max-width: 100%;
      overflow-x: auto;
    }
    
    .prose table {
      display: block;
      max-width: 100%;
      overflow-x: auto;
      white-space: nowrap;
    }
    
    .prose img {
      max-width: 100%;
      height: auto;
    }
    
    .prose p, .prose li, .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
      overflow-wrap: break-word;
      word-wrap: break-word;
      word-break: break-word;
    }
    
    .prose a {
      word-break: break-all;
    }
    
    .prose code {
      word-break: break-all;
      white-space: pre-wrap;
    }
    
    /* Ensure content container doesn't overflow */
    .content-container {
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
    }
  </style>
</svelte:head>

<div class="container py-8 max-w-4xl mx-auto">
  <div class="mb-6">
    <a href="/" class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft class="mr-2 h-4 w-4" />
      Back to all ROM hacks
    </a>
  </div>

  <div in:fade={{ duration: 300 }} class="content-container">
    <div class="relative aspect-video w-full overflow-hidden rounded-lg bg-muted mb-8">
      {#if rom.image}
        <img
          src={rom.image}
          alt={rom.name}
          class="h-full w-full object-cover"
          fetchpriority="high"
          decoding="async"
          srcset={`${rom.image}?width=640 640w,
                  ${rom.image}?width=768 768w,
                  ${rom.image}?width=1024 1024w,
                  ${rom.image}?width=1280 1280w,
                  ${rom.image}?width=1536 1536w`}
          sizes="(max-width: 640px) 100vw,
                 (max-width: 1024px) 75vw,
                 (max-width: 1280px) 66vw,
                 50vw"
        />
      {:else}
        <div class="flex h-full items-center justify-center">
          <Gamepad2 class="h-16 w-16 text-muted-foreground/50" />
        </div>
      {/if}
      {#if rom.version}
        <Badge
          variant="secondary"
          class="absolute right-4 top-4 bg-background/80 backdrop-blur px-3 py-1 text-sm"
        >
          {rom.version}
        </Badge>
      {/if}
    </div>

    <div class="grid gap-8 md:grid-cols-3">
      <div class="md:col-span-2 space-y-6">
        <div>
          <h1 class="text-3xl font-bold tracking-tight md:text-4xl break-words">{rom.name}</h1>
          <p class="mt-2 text-lg text-muted-foreground">{rom.author ? `by ${rom.author}` : ''}</p>
        </div>

        <div class="flex flex-wrap gap-2">
          {#if rom.base_game && rom.base_game.length > 0}
            {#each rom.base_game as game}
              <Badge variant="outline" class="px-3 py-1 text-sm">
                <Star class="mr-1 h-4 w-4 text-amber-500" />
                {game}
              </Badge>
            {/each}
          {/if}
        </div>

        <Separator />

        <div class="space-y-4">
          <h2 class="text-xl font-semibold">Features</h2>
          <div class="grid gap-2 sm:grid-cols-2">
            <Card>
              <CardContent class="p-4">
                <h3 class="font-medium mb-2">Difficulty</h3>
                <div class="flex flex-wrap gap-1.5">
                  {#each difficultyLevels as difficulty}
                    <Badge variant="secondary">
                      <Gamepad2 class="mr-1 h-3 w-3" />
                      {difficulty}
                    </Badge>
                  {/each}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent class="p-4">
                <h3 class="font-medium mb-2">Quality of Life</h3>
                <div class="flex flex-wrap gap-1.5">
                  {#each qolFeatures as feature}
                    <Badge variant="secondary">{feature}</Badge>
                  {/each}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {#if rom.content && rom.content.length > 0}
          <div class="space-y-4">
            <h2 class="text-xl font-semibold">Description</h2>
            <div class="prose prose-sm max-w-none dark:prose-invert">
              {#each rom.content as paragraph}
                <div>
                  {@html renderMarkdown(paragraph)}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <div class="space-y-6">
        <Card>
          <CardContent class="p-6 space-y-4">
            {#if rom.status && rom.status.length > 0}
              <div>
                <h3 class="text-sm font-medium text-muted-foreground">Status</h3>
                <div class="mt-1.5 flex flex-wrap gap-1.5">
                  {#each rom.status as status}
                    <Badge variant="outline">{status}</Badge>
                  {/each}
                </div>
              </div>
            {/if}

            {#if rom.date_updated}
              <div>
                <h3 class="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p class="mt-1">{formattedDate}</p>
              </div>
            {/if}

            {#if rom.console}
              <div>
                <h3 class="text-sm font-medium text-muted-foreground">Console</h3>
                <p class="mt-1">{rom.console}</p>
              </div>
            {/if}

            {#if mainLink}
              <div class="pt-2">
                <a 
                  href={mainLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                >
                  <ExternalLink class="mr-2 h-4 w-4" />
                  Visit Official Page
                </a>
              </div>
            {/if}
            
            <div class="pt-2">
              <CollectionButton 
                romId={rom.id} 
                isInCollection={isInCollection} 
                variant="outline" 
                size="default" 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</div> 