<script lang="ts">
  import { page } from "$app/stores";
  import { cn } from "$lib/utils";
  import { Button } from "$lib/components/ui/button";
  import ThemeToggle from "./theme-toggle.svelte";
  
  import GithubIcon from '~icons/mdi/github';
  import RedditIcon from '~icons/mdi/reddit';
  import DiscordIcon from '~icons/mdi/discord';
</script>

<header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="container flex h-14 items-center">
    <div class="mr-4 flex">
      <a href="/" class="mr-6 flex items-center space-x-2">
        <span class="font-bold">PokeRomCoDex</span>
      </a>
      <nav class="flex items-center space-x-6 text-sm font-medium">
        <a
          href="/"
          class={cn(
            "transition-colors hover:text-foreground/80",
            $page.url.pathname === "/" ? "text-foreground" : "text-foreground/60"
          )}
        >
          Browse
        </a>
        <a
          href="/faq"
          class={cn(
            "transition-colors hover:text-foreground/80",
            $page.url.pathname === "/faq" ? "text-foreground" : "text-foreground/60"
          )}
        >
          FAQ
        </a>
        <a
          href="/about"
          class={cn(
            "transition-colors hover:text-foreground/80",
            $page.url.pathname === "/about" ? "text-foreground" : "text-foreground/60"
          )}
        >
          About
        </a>
      </nav>
    </div>
    <div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
      <div class="flex items-center space-x-2">
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          class="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
        >
          <GithubIcon class="h-5 w-5" />
          <span class="sr-only">GitHub</span>
        </a>
        <a
          href="https://www.reddit.com/r/PokemonROMhacks/"
          target="_blank"
          rel="noreferrer"
          class="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
        >
          <RedditIcon class="h-5 w-5" />
          <span class="sr-only">Reddit</span>
        </a>
        <a
          href="https://discord.com"
          target="_blank"
          rel="noreferrer"
          class="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
        >
          <DiscordIcon class="h-5 w-5" />
          <span class="sr-only">Discord</span>
        </a>
        <ThemeToggle />
      </div>
    </div>
  </div>
</header> 