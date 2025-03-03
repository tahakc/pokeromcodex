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
  $: toneFeatures = Array.isArray(rom?.features?.tone) ? rom.features.tone : (rom?.features?.tone ? [rom.features.tone] : []);
  $: scaleFeatures = rom?.features?.scale || [];
  $: spriteFeatures = rom?.features?.sprites || [];
  $: newFeatures = rom?.features?.new_features || [];
  $: catchableFeatures = rom?.features?.catchable_pokemons || [];
  $: alteredGameplayFeatures = rom?.features?.altered_adjusted_gameplay || [];
  
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

<div class="container py-8 max-w-6xl mx-auto px-4">
  <div class="mb-8">
    <a href="/" class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
      <ArrowLeft class="mr-2 h-4 w-4" />
      Back to all ROM hacks
    </a>
  </div>

  <div in:fade={{ duration: 300 }} class="space-y-8">
    <div class="grid gap-8 lg:grid-cols-12">
      <!-- Main Content -->
      <div class="lg:col-span-7 space-y-8">
        <!-- Hero Section -->
        <div class="space-y-6">
          <div class="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
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
                class="absolute right-4 top-4 bg-background/80 backdrop-blur-sm px-3 py-1 text-sm"
              >
                {rom.version}
              </Badge>
            {/if}
          </div>

          <div>
            <h1 class="text-4xl font-bold tracking-tight md:text-5xl break-words mb-3">{rom.name}</h1>
            <div class="flex flex-wrap items-center gap-3">
              {#if rom.author}
                <p class="text-lg text-muted-foreground">by {rom.author}</p>
              {/if}
              {#if rom.base_game && rom.base_game.length > 0}
                <div class="flex flex-wrap gap-2">
                  {#each rom.base_game as game}
                    <Badge variant="outline" class="px-3 py-1 text-sm">
                      <Star class="mr-1 h-4 w-4 text-amber-500" />
                      {game}
                    </Badge>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </div>

        <Separator />

        <!-- Description Section -->
        {#if rom.content && rom.content.length > 0}
          <div class="space-y-4">
            <h2 class="text-2xl font-semibold">Description</h2>
            <Card class="hover:shadow-md transition-shadow">
              <CardContent class="p-5">
                <div class="prose prose-sm max-w-none dark:prose-invert">
                  {#each rom.content as paragraph}
                    <div>
                      {@html renderMarkdown(paragraph)}
                    </div>
                  {/each}
                </div>
              </CardContent>
            </Card>
          </div>
        {/if}
      </div>

      <!-- Sidebar -->
      <div class="lg:col-span-5 space-y-6">
        <!-- Status Card -->
        <Card class="hover:shadow-md transition-shadow">
          <CardContent class="p-6 space-y-6">
            {#if rom.status && rom.status.length > 0}
              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                <div class="flex flex-wrap gap-2">
                  {#each rom.status as status}
                    <Badge variant="outline" class="px-2.5 py-1">{status}</Badge>
                  {/each}
                </div>
              </div>
            {/if}

            {#if rom.date_updated}
              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-2">Last Updated</h3>
                <p class="text-sm">{formattedDate}</p>
              </div>
            {/if}

            {#if rom.console}
              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-2">Console</h3>
                <p class="text-sm">{rom.console}</p>
              </div>
            {/if}

            <div class="pt-2 space-y-3">
              {#if mainLink}
                <a 
                  href={mainLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex w-full items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  <ExternalLink class="mr-2 h-4 w-4" />
                  Visit Official Page
                </a>
              {/if}
              
              <CollectionButton 
                romId={rom.id} 
                isInCollection={isInCollection} 
                variant="outline" 
                size="default" 
                buttonClass="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <!-- Features Section -->
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold">Features</h2>
          <div class="space-y-4">
            <!-- Difficulty Card -->
            <Card class="hover:shadow-md transition-shadow">
              <CardContent class="p-5">
                <h3 class="font-medium mb-3 flex items-center gap-2">
                  <Gamepad2 class="h-5 w-5" />
                  Difficulty
                </h3>
                {#if difficultyLevels.length > 0}
                  <div class="flex flex-wrap gap-2">
                    {#each difficultyLevels as difficulty}
                      <Badge variant="secondary" class="px-2.5 py-1">{difficulty}</Badge>
                    {/each}
                  </div>
                {:else}
                  <div class="text-sm text-muted-foreground">No difficulty settings specified</div>
                {/if}
              </CardContent>
            </Card>

            <!-- QoL Card -->
            <Card class="hover:shadow-md transition-shadow">
              <CardContent class="p-5">
                <h3 class="font-medium mb-3 flex items-center gap-2">
                  <Star class="h-5 w-5" />
                  Quality of Life
                </h3>
                {#if qolFeatures.length > 0}
                  <div class="flex flex-wrap gap-2">
                    {#each qolFeatures as feature}
                      <Badge variant="secondary" class="px-2.5 py-1">{feature}</Badge>
                    {/each}
                  </div>
                {:else}
                  <div class="text-sm text-muted-foreground">No QoL features specified</div>
                {/if}
              </CardContent>
            </Card>

            <!-- Tone & Scale Card -->
            <Card class="hover:shadow-md transition-shadow">
              <CardContent class="p-5">
                <h3 class="font-medium mb-3 flex items-center gap-2">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313-12.454z"/></svg>
                  Tone & Scale
                </h3>
                <div class="space-y-3">
                  {#if toneFeatures.length > 0}
                    <div class="flex flex-wrap gap-2">
                      {#each toneFeatures as feature}
                        <Badge variant="secondary" class="px-2.5 py-1">{feature}</Badge>
                      {/each}
                    </div>
                  {/if}
                  {#if scaleFeatures.length > 0}
                    <div class="flex flex-wrap gap-2">
                      {#each scaleFeatures as feature}
                        <Badge variant="secondary" class="px-2.5 py-1">{feature}</Badge>
                      {/each}
                    </div>
                  {/if}
                  {#if toneFeatures.length === 0 && scaleFeatures.length === 0}
                    <div class="text-sm text-muted-foreground">No tone or scale features specified</div>
                  {/if}
                </div>
              </CardContent>
            </Card>

            <!-- Sprites Card -->
            <Card class="hover:shadow-md transition-shadow">
              <CardContent class="p-5">
                <h3 class="font-medium mb-3 flex items-center gap-2">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                  Sprites & Graphics
                </h3>
                {#if spriteFeatures.length > 0}
                  <div class="flex flex-wrap gap-2">
                    {#each spriteFeatures as feature}
                      <Badge variant="secondary" class="px-2.5 py-1">{feature}</Badge>
                    {/each}
                  </div>
                {:else}
                  <div class="text-sm text-muted-foreground">No sprite features specified</div>
                {/if}
              </CardContent>
            </Card>

            <!-- New Features Card -->
            <Card class="hover:shadow-md transition-shadow">
              <CardContent class="p-5">
                <h3 class="font-medium mb-3 flex items-center gap-2">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  New Features
                </h3>
                {#if newFeatures.length > 0}
                  <div class="flex flex-wrap gap-2">
                    {#each newFeatures as feature}
                      <Badge variant="secondary" class="px-2.5 py-1">{feature}</Badge>
                    {/each}
                  </div>
                {:else}
                  <div class="text-sm text-muted-foreground">No new features specified</div>
                {/if}
              </CardContent>
            </Card>

            <!-- Catchable Pokemon Card -->
            <Card class="hover:shadow-md transition-shadow">
              <CardContent class="p-5">
                <h3 class="font-medium mb-3 flex items-center gap-2">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  Catchable Pokemon
                </h3>
                {#if catchableFeatures.length > 0}
                  <div class="flex flex-wrap gap-2">
                    {#each catchableFeatures as feature}
                      <Badge variant="secondary" class="px-2.5 py-1">{feature}</Badge>
                    {/each}
                  </div>
                {:else}
                  <div class="text-sm text-muted-foreground">No catchable Pokemon features specified</div>
                {/if}
              </CardContent>
            </Card>

            <!-- Altered Gameplay Card -->
            <Card class="hover:shadow-md transition-shadow">
              <CardContent class="p-5">
                <h3 class="font-medium mb-3 flex items-center gap-2">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V4"/><path d="M5 9l7-7 7 7"/><path d="M5 15l7 7 7-7"/></svg>
                  Altered & Adjusted Gameplay
                </h3>
                {#if alteredGameplayFeatures.length > 0}
                  <div class="flex flex-wrap gap-2">
                    {#each alteredGameplayFeatures as feature}
                      <Badge variant="secondary" class="px-2.5 py-1">{feature}</Badge>
                    {/each}
                  </div>
                {:else}
                  <div class="text-sm text-muted-foreground">No altered gameplay features specified</div>
                {/if}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</div> 