<script lang="ts">
  import { page } from '$app/stores'
  import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
  import { Button } from '$lib/components/ui/button'
  import { goto } from '$app/navigation'
  import { enhance } from '$app/forms'
  import { invalidate } from '$app/navigation'

  // Import Shadcn dropdown menu components
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
  } from '$lib/components/ui/dropdown-menu'

  // Use reactive declaration for user data
  $: user = $page.data.user
  $: name = user?.user_metadata?.full_name || 'Guest'
  $: avatarUrl = user?.user_metadata?.avatar_url

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
    goto('/dashboard')
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
    <DropdownMenuItem class="cursor-pointer" on:click={handleDashboardClick}>Dashboard</DropdownMenuItem>
    <DropdownMenuItem class="cursor-pointer" on:click={handleProfileClick}>Profile</DropdownMenuItem>
    <DropdownMenuSeparator />
    <a
      href="/"
      class="w-full"
      on:click|preventDefault={() => {
        // Immediately redirect first, then handle sign out in background
        // Set a flag to indicate sign out in progress
        document.cookie = 'signing_out=true;path=/';
        // Force navigation BEFORE the async sign out
        window.location.replace('/');

        // Sign out happens after navigation is triggered
        // This ensures UI updates even if sign out is slow
        setTimeout(() => {
          // This may not complete but that's ok - we already navigated
          const supabase = $page.data.supabase;
          supabase.auth.signOut();
        }, 0);
      }}
    >
      <div class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-red-500 hover:bg-red-500 hover:text-white transition-all">
        Sign out
      </div>
    </a>
  </DropdownMenuContent>
</DropdownMenu>
<style>
  :global(body.modal-open) {
    padding-right: 0 !important;
  }
</style>
