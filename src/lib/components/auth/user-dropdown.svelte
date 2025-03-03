<script lang="ts">
  import { page } from '$app/stores'
  import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
  import { Button } from '$lib/components/ui/button'
  import { goto } from '$app/navigation'
  import { enhance } from '$app/forms'
  
  // Import Shadcn dropdown menu components
  import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
  } from '$lib/components/ui/dropdown-menu'
  
  export let user = $page.data.user
  
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'
  const avatarUrl = user?.user_metadata?.avatar_url

  let open = false
  
  // Immediately reset padding when dropdown opens
  $: if (open && typeof document !== 'undefined') {
    document.body.style.paddingRight = '0px';
    // Use requestAnimationFrame for browser paint cycle alignment
    requestAnimationFrame(() => {
      document.body.style.paddingRight = '0px';
    });
  }
  
  function getInitials(name: string) {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  function handleProfileClick() {
    goto('/profile')
  }
  
  function handleDashboardClick() {
    goto('/private')
  }
</script>

<DropdownMenu bind:open>
  <DropdownMenuTrigger>
    <Button variant="ghost" class="relative h-8 w-8 rounded-full">
      <Avatar class="h-8 w-8">
        {#if avatarUrl}
          <AvatarImage src={avatarUrl} alt={name} />
        {/if}
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent class="w-56" align="end">
    <DropdownMenuLabel class="font-normal">
      <div class="flex flex-col space-y-1">
        <p class="text-sm font-medium leading-none">{name}</p>
        <p class="text-xs leading-none text-muted-foreground">{user?.email || ''}</p>
      </div>
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem on:click={handleDashboardClick}>Dashboard</DropdownMenuItem>
    <DropdownMenuItem on:click={handleProfileClick}>Profile</DropdownMenuItem>
    <DropdownMenuSeparator />
    <form method="POST" action="/profile?/signout" use:enhance>
      <DropdownMenuItem class="cursor-pointer text-destructive focus:text-destructive">
        Sign out
      </DropdownMenuItem>
    </form>
  </DropdownMenuContent>
</DropdownMenu> 
<style>
  /* Add specific CSS to override any modal padding behaviors */
  :global(body.modal-open) {
    padding-right: 0 !important;
  }
</style>