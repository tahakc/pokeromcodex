<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { fly, scale } from "svelte/transition";
  import { flip } from "svelte/animate";
  import type { Rom, SearchFilters } from "$lib/types";

  export let filterOptions: {
    baseGames: string[];
    statuses: string[];
    difficulties: string[];
    features: string[];
  };
  
  export let selectedFilters: SearchFilters;
  export let onFilterChange: (
    category: keyof SearchFilters,
    value: string
  ) => void;
</script>

<div class="space-y-6">
  <div>
    <h3 class="mb-3 text-sm font-medium text-muted-foreground">Base Game</h3>
    <div class="flex flex-wrap gap-2">
      {#each filterOptions.baseGames as item (item)}
        {@const isSelected = selectedFilters.baseGame.includes(item)}
        <div
          in:scale={{ duration: 200, start: 0.95 }}
          animate:flip={{ duration: 200 }}
        >
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            class={cn(
              "h-7 whitespace-nowrap",
              isSelected && "bg-primary text-primary-foreground"
            )}
            on:click={() => onFilterChange("baseGame", item)}
          >
            {item}
            {#if isSelected}
              <Badge
                variant="secondary"
                class="ml-2 bg-primary-foreground/20 text-primary-foreground"
              >
                ✓
              </Badge>
            {/if}
          </Button>
        </div>
      {/each}
    </div>
  </div>

  <div>
    <h3 class="mb-3 text-sm font-medium text-muted-foreground">Status</h3>
    <div class="flex flex-wrap gap-2">
      {#each filterOptions.statuses as item (item)}
        {@const isSelected = selectedFilters.status.includes(item)}
        <div
          in:scale={{ duration: 200, start: 0.95 }}
          animate:flip={{ duration: 200 }}
        >
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            class={cn(
              "h-7 whitespace-nowrap",
              isSelected && "bg-primary text-primary-foreground"
            )}
            on:click={() => onFilterChange("status", item)}
          >
            {item}
            {#if isSelected}
              <Badge
                variant="secondary"
                class="ml-2 bg-primary-foreground/20 text-primary-foreground"
              >
                ✓
              </Badge>
            {/if}
          </Button>
        </div>
      {/each}
    </div>
  </div>

  <div>
    <h3 class="mb-3 text-sm font-medium text-muted-foreground">Difficulty</h3>
    <div class="flex flex-wrap gap-2">
      {#each filterOptions.difficulties as item (item)}
        {@const isSelected = selectedFilters.difficulty.includes(item)}
        <div
          in:scale={{ duration: 200, start: 0.95 }}
          animate:flip={{ duration: 200 }}
        >
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            class={cn(
              "h-7 whitespace-nowrap",
              isSelected && "bg-primary text-primary-foreground"
            )}
            on:click={() => onFilterChange("difficulty", item)}
          >
            {item}
            {#if isSelected}
              <Badge
                variant="secondary"
                class="ml-2 bg-primary-foreground/20 text-primary-foreground"
              >
                ✓
              </Badge>
            {/if}
          </Button>
        </div>
      {/each}
    </div>
  </div>

  <div>
    <h3 class="mb-3 text-sm font-medium text-muted-foreground">Features</h3>
    <div class="flex flex-wrap gap-2">
      {#each filterOptions.features as item (item)}
        {@const isSelected = selectedFilters.features.includes(item)}
        <div
          in:scale={{ duration: 200, start: 0.95 }}
          animate:flip={{ duration: 200 }}
        >
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            class={cn(
              "h-7 whitespace-nowrap",
              isSelected && "bg-primary text-primary-foreground"
            )}
            on:click={() => onFilterChange("features", item)}
          >
            {item}
            {#if isSelected}
              <Badge
                variant="secondary"
                class="ml-2 bg-primary-foreground/20 text-primary-foreground"
              >
                ✓
              </Badge>
            {/if}
          </Button>
        </div>
      {/each}
    </div>
  </div>
</div> 