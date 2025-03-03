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
  import { toast } from 'svelte-sonner'
  import GithubIcon from '~icons/mdi/github'
  import DiscordIcon from '~icons/fa-brands/discord'
  
  export let data
  
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
  
  onMount(() => {
    const url = $page.url
    console.log("URL parameters:", Object.fromEntries(url.searchParams.entries()))
    
    error = url.searchParams.get('error')
    errorCode = url.searchParams.get('error_code')
    errorDescription = url.searchParams.get('error_description')
    
    if (!error && url.hash) {
      const hashParams = new URLSearchParams(url.hash.substring(1))
      error = error || hashParams.get('error')
      errorCode = errorCode || hashParams.get('error_code')
      errorDescription = errorDescription || hashParams.get('error_description')
      console.log("Hash parameters:", Object.fromEntries(hashParams.entries()))
    }
    
    console.log("Processing auth result:", { error, errorCode, errorDescription })
    
    if (error) {
      let errorMessage = errorDescription || error
      
      console.log("Showing error toast:", errorMessage)
      showErrorToast(errorMessage)
      
      setTimeout(() => {
        const cleanUrl = new URL(window.location.href)
        cleanUrl.search = ''
        cleanUrl.hash = ''
        window.history.replaceState({}, '', cleanUrl.toString())
      }, 2000)
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
          
          <div>
            <h3 class="text-sm font-medium text-muted-foreground mb-1">Last Sign In</h3>
            <p class="text-sm">{new Date(user?.last_sign_in_at || Date.now()).toLocaleString()}</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-muted-foreground mb-1">Account Created</h3>
            <p class="text-sm">{new Date(user?.created_at || Date.now()).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter class="flex justify-between pt-6">
        <form method="POST" action="?/signout" use:enhance={() => {
          isLoading = true
          return async ({ update }) => {
            isLoading = false
            await update()
          }
        }}>
          <Button type="submit" variant="destructive" disabled={isLoading}>
            {isLoading ? 'Signing out...' : 'Sign out'}
          </Button>
        </form>
        
        <Button variant="outline" on:click={() => history.back()}>Back</Button>
      </CardFooter>
    </Card>
  </div>
</div> 