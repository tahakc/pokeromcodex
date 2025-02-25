<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Search, ChevronDown } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";

  export let value: string;
  export let onChange: (value: string) => void;
  export let showFiltersButton = false;
  export let onFiltersClick = () => {};
  export let filtersActive = false;
  export let filtersCount = 0;
  export let filtersOpen = false;
</script>

<div class="relative flex w-full items-center">
  <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <Input
    {value}
    on:input={(e) => onChange(e.currentTarget.value)}
    class={cn(
      "pl-9", 
      showFiltersButton && "pr-24"
    )}
    placeholder="Search ROM hacks by title, creator, or base game..."
  />
  
  {#if showFiltersButton}
    <div class="absolute right-0 top-0 bottom-0 flex items-center">
      <div class="h-full w-px bg-input"></div>
      <Button
        variant="ghost"
        size="sm"
        class="h-full rounded-l-none px-3"
        on:click={onFiltersClick}
      >
        Filters
        {#if filtersActive}
          <span class="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
            {filtersCount}
          </span>
        {/if}
        <ChevronDown
          class="ml-2 h-4 w-4 transition-transform duration-200 {
            filtersOpen ? 'rotate-180' : ''
          }"
        />
      </Button>
    </div>
  {/if}
</div> 