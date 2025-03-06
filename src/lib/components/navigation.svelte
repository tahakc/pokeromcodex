<script lang="ts">
  import { page } from "$app/stores";
  import { cn } from "$lib/utils";
  import { Button } from "$lib/components/ui/button";
  import ThemeToggle from "./theme-toggle.svelte";
  import { Sheet, SheetContent, SheetTrigger } from "$lib/components/ui/sheet";
  import { Menu } from "lucide-svelte";
  import { fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { isAnyModalOpen } from "$lib/stores/modal";
  import UserDropdown from "$lib/components/auth/user-dropdown.svelte";
  
  import GithubIcon from '~icons/mdi/github';
  import RedditIcon from '~icons/mdi/reddit';
  import DiscordIcon from '~icons/fa-brands/discord';
  
  let open = false;
  
  $: $isAnyModalOpen = open;
  
  const inTransitionConfig = {
    x: "100%",
    duration: 300,
    easing: quintOut
  };
  
  const outTransitionConfig = {
    x: "100%",
    duration: 250,
    easing: quintOut
  };
  
  const navItems = [
    { href: "/", label: "Browse" },
    { href: "/faq", label: "FAQ" },
    { href: "/about", label: "About" }
  ];
  
  const socialLinks = [
    { href: "https://github.com/tahakc/pokeromcodex", icon: GithubIcon, label: "GitHub" },
    { href: "https://www.reddit.com/r/PokemonROMhacks/", icon: RedditIcon, label: "Reddit" },
    { href: "https://discord.gg/aHXzsHXz2b", icon: DiscordIcon, label: "Discord" }
  ];
  
  function closeSheet() {
    open = false;
  }
</script>

<header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="container flex h-14 items-center justify-between">
    <div class="flex items-center">
      <a href="/" class="mr-6 flex items-center space-x-2">
        <span class="font-bold">PokeRomCodex</span>
      </a>
      
      <nav class="hidden md:flex items-center space-x-6 text-sm font-medium">
        {#each navItems as item}
          <a
            href={item.href}
            class={cn(
              "transition-colors hover:text-foreground/80",
              $page.url.pathname === item.href ? "text-foreground" : "text-foreground/60"
            )}
          >
            {item.label}
          </a>
        {/each}
      </nav>
    </div>
    
    <div class="flex items-center space-x-2">
      <div class="hidden md:flex items-center space-x-1">
        {#each socialLinks as link}
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
          >
            <svelte:component this={link.icon} class="h-5 w-5" />
            <span class="sr-only">{link.label}</span>
          </a>
        {/each}
      </div>
      
      <ThemeToggle />
      
      {#if $page?.data?.session}
        <UserDropdown />
      {:else}
        <a href="/auth">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </a>
      {/if}
      
      <div class="flex md:hidden">
        <Sheet bind:open>
          <SheetTrigger>
            <Button variant="outline" size="icon" class="h-9 w-9 p-0">
              <Menu class="h-5 w-5" />
              <span class="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="right" 
            inTransition={fly}
            inTransitionConfig={inTransitionConfig}
            outTransition={fly}
            outTransitionConfig={outTransitionConfig}
            class="shadow-xl border-l"
          >
            <nav class="flex flex-col gap-4 mt-8">
              {#each navItems as item}
                <a
                  href={item.href}
                  class={cn(
                    "text-lg font-medium transition-colors hover:text-foreground/80",
                    $page.url.pathname === item.href ? "text-foreground" : "text-foreground/60"
                  )}
                  on:click={closeSheet}
                >
                  {item.label}
                </a>
              {/each}
              
              {#if $page.data.session}
                <a
                  href="/profile"
                  class="text-lg font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                  on:click={closeSheet}
                >
                  Profile
                </a>
                <form method="POST" action="/profile?/signout">
                  <Button type="submit" variant="ghost" class="w-full justify-start p-0 h-auto text-lg font-medium text-destructive">
                    Sign out
                  </Button>
                </form>
              {:else}
                <a
                  href="/auth"
                  class="text-lg font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                  on:click={closeSheet}
                >
                  Sign In
                </a>
              {/if}
              
              <div class="flex items-center gap-2 mt-4 pt-4 border-t">
                {#each socialLinks as link}
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    on:click={closeSheet}
                  >
                    <svelte:component this={link.icon} class="h-5 w-5" />
                    <span class="sr-only">{link.label}</span>
                  </a>
                {/each}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </div>
</header> 