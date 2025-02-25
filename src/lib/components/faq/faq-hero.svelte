<script lang="ts">
  import { HelpCircle } from "lucide-svelte";
</script>

<div class="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-16">
  <div class="absolute inset-0 grid grid-cols-3 -space-x-52 opacity-20 md:grid-cols-5 md:-space-x-24 lg:grid-cols-6">
    {#each Array(20) as _, i}
      <div class="flex h-full items-center justify-center">
        <HelpCircle size={24 + Math.random() * 24} class="text-muted-foreground/30" />
      </div>
    {/each}
  </div>
  
  <div class="container relative">
    <div class="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
      <h1 class="text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
        Frequently Asked Questions
      </h1>
      <p class="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
        Find answers to common questions about Pokémon ROM hacks and using PokeRomCodex
      </p>
    </div>
  </div>
</div> 