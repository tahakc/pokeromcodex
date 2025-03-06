<script lang="ts">
  import { page } from '$app/stores'
  import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
  import { Button } from '$lib/components/ui/button'
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card'
  import { Separator } from '$lib/components/ui/separator'
  import { enhance } from '$app/forms'
  import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert'
  import { AlertCircle } from 'lucide-svelte'
  import { onMount } from 'svelte'
  import { toast } from '$lib/components/ui/sonner'
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import GithubIcon from '~icons/mdi/github'
  import DiscordIcon from '~icons/fa-brands/discord'
  import type { UserIdentity } from '@supabase/supabase-js'
  
  // Define the type for the data prop
  interface ProfileData {
    identities: UserIdentity[];
    linkedAccounts: Array<{
      id: string;
      userId: string;
      provider: string;
      createdAt: string;
    }>;
  }
  
  export let data: ProfileData
  
  onMount(() => {
    // Handle any timestamp parameters by cleaning the URL
    if (browser && (window.location.search.includes('t=') || window.location.search.includes('refresh=true'))) {
      // Clean the URL without triggering navigation
      if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    
    // Check if we're coming from a fresh login
    if (browser && localStorage.getItem('freshLogin')) {
      console.log('Fresh login detected, clearing flag');
      localStorage.removeItem('freshLogin');
      
      // Check if user object is available
      if (!user) {
        console.log('User data not available after login, forcing reload');
        window.location.reload();
      } else {
        toast.success('Successfully signed in!');
      }
    }
  });
  
  const user = $page.data.user
  const provider = user?.app_metadata?.provider || 'Unknown'
  const email = user?.email || 'No email provided'
  
  // Initialize avatar and name
  let avatarUrl = user?.user_metadata?.avatar_url
  let name = user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'
  
  // Function to extract GitHub username if GitHub is the provider
  function getGitHubUsername(userData: any) {
    if (!userData?.identities?.[0]?.identity_data) return null
    
    const identity = userData.identities[0]
    if (identity.provider.toLowerCase() !== 'github') return null
    
    return identity.identity_data.user_name || 
           identity.identity_data.username || 
           identity.identity_data.preferred_username || 
           identity.identity_data.login ||
           identity.identity_data.nickname ||
           null
  }
  
  // Set the GitHub username if applicable
  if (provider.toLowerCase() === 'github') {
    const username = getGitHubUsername(data)
    if (username) {
      name = username
      console.log('Using GitHub username:', username)
    }
  }
  
  let errorToastShown = false
  
  let error: string | null = null
  let errorCode: string | null = null
  let errorDescription: string | null = null
  let linkSuccess: string | null = null
  let alreadyLinked: string | null = null
  
  function showErrorToast(message: string, delay = 1000) {
    console.log("Scheduling error toast to show in", delay, "ms:", message)
    setTimeout(() => {
      console.log("Now showing error toast:", message)
      toast.error(message, {
        description: 'Authentication error',
        duration: 8000,
      })
      errorToastShown = true
    }, delay)
  }
  
  function showSuccessToast(message: string, description: string, delay = 1000) {
    setTimeout(() => {
      toast.success(message, {
        description,
        duration: 5000,
      })
    }, delay)
  }
  
  onMount(() => {
    const url = $page.url
    console.log("URL parameters:", Object.fromEntries(url.searchParams.entries()))
    
    error = url.searchParams.get('error')
    errorCode = url.searchParams.get('error_code')
    errorDescription = url.searchParams.get('error_description')
    linkSuccess = url.searchParams.get('link_success')
    alreadyLinked = url.searchParams.get('already_linked')
    
    if (!error && url.hash) {
      const hashParams = new URLSearchParams(url.hash.substring(1))
      error = error || hashParams.get('error')
      errorCode = errorCode || hashParams.get('error_code')
      errorDescription = errorDescription || hashParams.get('error_description')
      console.log("Hash parameters:", Object.fromEntries(hashParams.entries()))
    }
    
    console.log("Processing auth result:", { error, errorCode, errorDescription, linkSuccess, alreadyLinked })
    
    if (error) {
      let errorMessage = errorDescription || error
      
      console.log("Showing error toast:", errorMessage)
      showErrorToast(errorMessage)
    }
    
    if (linkSuccess) {
      showSuccessToast(
        'Account linked successfully', 
        `Your ${linkSuccess} account has been linked to your profile`
      )
    }
    
    if (alreadyLinked) {
      showSuccessToast(
        'Account already linked', 
        `Your ${alreadyLinked} account is already linked to your profile`
      )
    }
    
    if (error && !errorToastShown) {
      setTimeout(() => {
        if (!errorToastShown) {
          console.log("Fallback: Force showing error toast again after delay")
          let errorMessage = errorDescription || error
          if (errorMessage) {
            toast.error(errorMessage.toString(), {
              description: 'Authentication error',
              duration: 8000,
            })
          }
        }
      }, 3000)
    }
    
    // Clean up URL parameters after processing
    setTimeout(() => {
      const cleanUrl = new URL(window.location.href)
      cleanUrl.search = ''
      cleanUrl.hash = ''
      window.history.replaceState({}, '', cleanUrl.toString())
    }, 2000)
  })
  
  function getInitials(name: string) {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  function getProviderIcon(providerName: string) {
    switch (providerName.toLowerCase()) {
      case 'github':
        return GithubIcon
      case 'discord':
        return DiscordIcon
      default:
        return null
    }
  }
  
  function getProviderColor(providerName: string) {
    switch (providerName.toLowerCase()) {
      case 'github':
        return 'bg-black text-white'
      case 'discord':
        return 'bg-[#5865F2] text-white'
      default:
        return 'bg-primary text-primary-foreground'
    }
  }
  
  // Get the list of linked accounts from the data
  const linkedAccounts = data.linkedAccounts || []
  console.log('Linked accounts:', linkedAccounts)
  
  // Determine which providers are already linked
  const linkedProviders = new Set(linkedAccounts.map(account => account.provider.toLowerCase()))
  linkedProviders.add(provider.toLowerCase())
  
  const isGithubLinked = linkedProviders.has('github')
  const isDiscordLinked = linkedProviders.has('discord')
  
  let isLoading = false
</script>

<svelte:head>
  <title>Profile - PokeROM Codex</title>
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
              {#if getProviderIcon(provider)}
                <div class={`p-1.5 rounded-md ${getProviderColor(provider)}`}>
                  <svelte:component this={getProviderIcon(provider)} class="h-4 w-4" />
                </div>
              {/if}
              <p class="text-sm capitalize">{provider}</p>
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
                  <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Linked</span>
                {:else}
                  <form method="POST" action="/profile?/linkAccount" use:enhance={() => {
                    isLoading = true
                    return async ({ update }) => {
                      isLoading = false
                      await update()
                    }
                  }}>
                    <input type="hidden" name="provider" value="github" />
                    <Button type="submit" variant="outline" size="sm" disabled={isLoading}>
                      Link Account
                    </Button>
                  </form>
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
                  <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Linked</span>
                {:else}
                  <form method="POST" action="/profile?/linkAccount" use:enhance={() => {
                    isLoading = true
                    return async ({ update }) => {
                      isLoading = false
                      await update()
                    }
                  }}>
                    <input type="hidden" name="provider" value="discord" />
                    <Button type="submit" variant="outline" size="sm" disabled={isLoading}>
                      Link Account
                    </Button>
                  </form>
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
          isLoading = true
          return async ({ result }) => {
            isLoading = false
            // Explicitly handle redirect from the server
            if (result.type === 'redirect') {
              window.location.href = result.location;
            }
          }
        }}>
          <Button type="submit" variant="outline" disabled={isLoading} class="text-red-500 hover:bg-red-500 hover:text-white transition-all">Sign out</Button>
        </form>
      </CardContent>
    </Card>
  </div>
</div>