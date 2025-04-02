<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { AlertCircle, CheckCircle, GithubIcon, Unlink } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
  import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Separator } from '$lib/components/ui/separator';
  import { getInitials } from '$lib/utils';
  import type { UserIdentity } from '@supabase/supabase-js';
  import DiscordIcon from '~icons/fa-brands/discord';
  import { onMount } from 'svelte';

  let isLoading = false;
  let isLinking = false;

  $: user = $page.data.session?.user;
  $: email = user?.email || 'No email';
  $: name = user?.user_metadata?.name || user?.user_metadata?.full_name || 'Anonymous';
  $: avatarUrl = user?.user_metadata?.avatar_url || '';
  
  // Get identities and linked status from page data
  $: identities = ($page.data.identities || []) as UserIdentity[];
  $: isGithubLinked = identities.some(i => i.provider === 'github');
  $: isDiscordLinked = identities.some(i => i.provider === 'discord');
  $: primaryProvider = identities[0]?.provider || 'Unknown';
  $: linked = $page.data.linked;

  // Show a toast notification when account is linked
  onMount(() => {
    if (linked) {
      toast.success('Account linked successfully', { 
        description: 'Your account has been successfully linked' 
      });
    }
  });

  function getProviderIcon(provider: string) {
    switch (provider.toLowerCase()) {
      case 'github':
        return GithubIcon;
      case 'discord':
        return DiscordIcon;
      default:
        return null;
    }
  }

  function getProviderColor(provider: string) {
    switch (provider.toLowerCase()) {
      case 'github':
        return 'bg-black text-white';
      case 'discord':
        return 'bg-[#5865F2] text-white';
      default:
        return 'bg-gray-100';
    }
  }

  // Function to handle direct redirect for account linking
  const linkAccount = async (provider: string) => {
    try {
      isLinking = true;

      // Get the OAuth URL from the server
      const formData = new FormData();
      formData.append('provider', provider);

      const response = await fetch('/profile?/getOAuthUrl', {
        method: 'POST',
        body: formData,
        headers: {
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Error', { description: errorData.error || `Failed to get OAuth URL (${response.status})` });
        isLinking = false;
        return;
      }

      const result = await response.json();

      // Parse the response data - it's coming as a complex JSON structure
      if (result.data) {
        try {
          // The data is a string that needs to be parsed
          const parsedData = JSON.parse(result.data);
          
          // Extract the URL from the parsed data
          // Based on the console output, it appears to be the second element in the array
          const oauthUrl = parsedData[1];
          
          if (oauthUrl && typeof oauthUrl === 'string') {
            // Redirect to the OAuth URL directly
            window.location.href = oauthUrl;
            return;
          }
        } catch (parseError) {
        }
      }
      
      // Direct URL access as fallback
      if (result.url && typeof result.url === 'string') {
        window.location.href = result.url;
        return;
      }
      
      // If we get here, something went wrong with parsing
      toast.error('Error', { description: 'Invalid OAuth URL received' });
      isLinking = false;
    } catch (error) {
      toast.error('Error', { description: 'Failed to start account linking' });
      isLinking = false;
    }
  };
</script>

<svelte:head>
  <title>Your Profile - PokeROM Codex</title>
  <meta name="description" content="Manage your profile on PokeROM Codex" />
</svelte:head>

<div class="container py-8">
  <div class="max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold tracking-tight mb-6">Your Profile</h1>

    {#if $page.form?.error}
      <Alert variant="destructive" class="mb-6">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {$page.form.error}
        </AlertDescription>
      </Alert>
    {/if}

    {#if linked}
      <Alert class="mb-6 border-green-500 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-300">
        <CheckCircle class="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>
          Your account has been successfully linked
        </AlertDescription>
      </Alert>
    {/if}

    <Card>
      <CardHeader class="flex flex-row items-center gap-4">
        <Avatar class="h-16 w-16">
          {#if avatarUrl}
            <AvatarImage src={avatarUrl} alt={name} />
          {/if}
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle class="text-2xl">{name}</CardTitle>
          <CardDescription>{email}</CardDescription>
        </div>
      </CardHeader>

      <CardContent class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-medium text-muted-foreground mb-1">Account ID</h3>
            <p class="text-sm break-all">{user?.id || 'Unknown'}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-muted-foreground mb-1">Provider</h3>
            <div class="flex items-center gap-2">
              {#if getProviderIcon(primaryProvider)}
                <div class={`p-1.5 rounded-md ${getProviderColor(primaryProvider)}`}>
                  <svelte:component this={getProviderIcon(primaryProvider)} class="h-4 w-4" />
                </div>
              {/if}
              <p class="text-sm capitalize">{primaryProvider}</p>
            </div>
          </div>

          <!-- Linked Accounts Section -->
          <div class="col-span-1 md:col-span-2 mt-4">
            <h3 class="text-sm font-medium text-muted-foreground mb-3">Linked Accounts</h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- GitHub Account -->
              <div class="flex items-center justify-between p-3 border rounded-lg">
                <div class="flex items-center gap-2">
                  <div class="p-1.5 rounded-md bg-black text-white">
                    <GithubIcon class="h-4 w-4" />
                  </div>
                  <span class="text-sm font-medium">GitHub</span>
                </div>

                {#if isGithubLinked}
                  <div class="flex items-center gap-2">
                    <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Linked</span>
                    {#if primaryProvider.toLowerCase() !== 'github'}
                      <form method="POST" action="/profile?/unlinkIdentity">
                        <input type="hidden" name="provider" value="github" />
                        <Button type="submit" variant="ghost" size="sm" class="h-7 px-2 text-red-500 hover:text-red-700">
                          <span class="sr-only">Unlink</span>
                          <Unlink class="h-4 w-4" />
                        </Button>
                      </form>
                    {/if}
                  </div>
                {:else}
                  <Button
                    variant="outline"
                    size="sm"
                    on:click={() => linkAccount('github')}
                    disabled={isLinking}
                  >
                    {#if isLinking}
                      <div class="mr-2 h-4 w-4 animate-spin"></div>
                      Linking...
                    {:else}
                      Link Account
                    {/if}
                  </Button>
                {/if}
              </div>

              <!-- Discord Account -->
              <div class="flex items-center justify-between p-3 border rounded-lg">
                <div class="flex items-center gap-2">
                  <div class="p-1.5 rounded-md bg-[#5865F2] text-white">
                    <DiscordIcon class="h-4 w-4" />
                  </div>
                  <span class="text-sm font-medium">Discord</span>
                </div>

                {#if isDiscordLinked}
                  <div class="flex items-center gap-2">
                    <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Linked</span>
                    {#if primaryProvider.toLowerCase() !== 'discord'}
                      <form method="POST" action="/profile?/unlinkIdentity">
                        <input type="hidden" name="provider" value="discord" />
                        <Button type="submit" variant="ghost" size="sm" class="h-7 px-2 text-red-500 hover:text-red-700">
                          <span class="sr-only">Unlink</span>
                          <Unlink class="h-4 w-4" />
                        </Button>
                      </form>
                    {/if}
                  </div>
                {:else}
                  <Button
                    variant="outline"
                    size="sm"
                    on:click={() => linkAccount('discord')}
                    disabled={isLinking}
                  >
                    {#if isLinking}
                      <div class="mr-2 h-4 w-4 animate-spin"></div>
                      Linking...
                    {:else}
                      Link Account
                    {/if}
                  </Button>
                {/if}
              </div>
            </div>

            <p class="text-xs text-muted-foreground mt-2">
              Linking accounts allows you to access the same collection data regardless of which provider you use to log in.
            </p>
          </div>
        </div>

        <Separator />

        <form method="POST" action="?/signout" class="flex justify-end" use:enhance={() => {
          isLoading = true;
          return async ({ result }) => {
            isLoading = false;
            // Explicitly handle redirect from the server
            if (result.type === 'redirect') {
              window.location.href = result.location;
            }
          };
        }}>
          <Button type="submit" variant="outline" disabled={isLoading} class="text-red-500 hover:bg-red-500 hover:text-white transition-all">Sign out</Button>
        </form>
      </CardContent>
    </Card>
  </div>
</div>
