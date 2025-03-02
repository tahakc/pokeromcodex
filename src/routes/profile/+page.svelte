<script lang="ts">
  import { page } from '$app/stores'
  import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
  import { Button } from '$lib/components/ui/button'
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card'
  import { Separator } from '$lib/components/ui/separator'
  import { enhance } from '$app/forms'
  import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert'
  import { AlertCircle, CheckCircle2, Github, MessageSquare, Plus, Trash2, UserCircle } from 'lucide-svelte'
  import { Badge } from '$lib/components/ui/badge'
  import { onMount } from 'svelte'
  import { toast } from 'svelte-sonner'
  
  export let data
  
  const user = $page.data.user
  const provider = user?.app_metadata?.provider || 'Unknown'
  const email = user?.email || 'No email provided'
  let preferredProvider = user?.user_metadata?.preferred_provider || provider
  
  // Get identities from page data
  const identities = data.identities || []
  
  // Function to extract GitHub username from identity data
  function getGitHubUsername(identity: any) {
    if (!identity || !identity.identity_data) return null
    
    return identity.identity_data.user_name || 
           identity.identity_data.username || 
           identity.identity_data.preferred_username || 
           identity.identity_data.login ||
           identity.identity_data.nickname ||
           null
  }
  
  // Initialize avatar and name based on preferred provider
  let avatarUrl: string | null = null
  let name: string = 'User'
  
  // Find the preferred identity if it exists
  const preferredIdentity = identities.find(i => 
    i.provider.toLowerCase() === preferredProvider?.toLowerCase()
  )
  
  // Set initial avatar and name values
  if (preferredIdentity) {
    if (preferredIdentity.identity_data?.avatar_url) {
      avatarUrl = preferredIdentity.identity_data.avatar_url
    } else {
      avatarUrl = user?.user_metadata?.avatar_url
    }
    
    if (preferredIdentity.provider.toLowerCase() === 'github') {
      const username = getGitHubUsername(preferredIdentity)
      if (username) {
        name = username
        console.log('Initial display set to GitHub username:', username)
      } else {
        name = preferredIdentity.identity_data?.full_name || 
               preferredIdentity.identity_data?.name || 
               user?.user_metadata?.full_name || 
               user?.user_metadata?.name || 
               'User'
      }
    } else {
      name = preferredIdentity.identity_data?.full_name || 
             preferredIdentity.identity_data?.name || 
             user?.user_metadata?.full_name || 
             user?.user_metadata?.name || 
             'User'
    }
  } else {
    // Fallback to user metadata if no preferred identity found
    avatarUrl = user?.user_metadata?.avatar_url
    name = user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'
  }
  
  let linkedProvider = $page.url.searchParams.get('linked')
  let showLinkedSuccess = false
  let showPreferredSuccess = false
  let preferredMessage = ''
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
    let linked = url.searchParams.get('linked')
    
    if (!error && url.hash) {
      const hashParams = new URLSearchParams(url.hash.substring(1))
      error = error || hashParams.get('error')
      errorCode = errorCode || hashParams.get('error_code')
      errorDescription = errorDescription || hashParams.get('error_description')
      console.log("Hash parameters:", Object.fromEntries(hashParams.entries()))
    }
    
    console.log("Processing auth result:", { error, errorCode, errorDescription, linked })
    
    if (error) {
      let errorMessage = errorDescription || error
      
      if (error === 'server_error' && errorCode === 'identity_already_exists') {
        errorMessage = 'This identity is already linked to another account'
      }
      
      console.log("Showing error toast:", errorMessage)
      
      showErrorToast(errorMessage)
      
      setTimeout(() => {
        const cleanUrl = new URL(window.location.href)
        cleanUrl.search = ''
        cleanUrl.hash = ''
        window.history.replaceState({}, '', cleanUrl.toString())
      }, 2000)
    } else if (linked) {
      const linkedIdentity = identities.find(i => i.provider.toLowerCase() === linked.toLowerCase())
      
      if (linkedIdentity) {
        console.log('Automatically setting newly linked account as preferred provider')
        updateProfileDisplay(linkedIdentity)
      } else {
        toast.success(`Successfully linked ${linked} account`, {
          duration: 5000
        })
      }
      
      setTimeout(() => {
        const cleanUrl = new URL(window.location.href)
        cleanUrl.searchParams.delete('linked')
        window.history.replaceState({}, '', cleanUrl.toString())
      }, 1000)
    }
    
    if (error && !errorToastShown) {
      setTimeout(() => {
        if (!errorToastShown) {
          console.log("Fallback: Force showing error toast again after delay")
          let errorMessage = errorDescription || error
          if (error === 'server_error' && errorCode === 'identity_already_exists') {
            errorMessage = 'This identity is already linked to another account'
          }
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
        return Github
      case 'discord':
        return MessageSquare
      default:
        return null
    }
  }
  
  function getProviderColor(providerName: string) {
    switch (providerName.toLowerCase()) {
      case 'github':
        return 'bg-black text-white'
      case 'discord':
        return 'bg-indigo-600 text-white'
      default:
        return 'bg-primary text-primary-foreground'
    }
  }
  
  function updateProfileDisplay(identity: any) {
    preferredProvider = identity.provider
    
    if (identity.provider.toLowerCase() === 'github') {
      console.log('GitHub Identity Data:', JSON.stringify(identity.identity_data, null, 2));
    }
    
    if (identity.identity_data) {
      if (identity.identity_data.avatar_url) {
        avatarUrl = identity.identity_data.avatar_url
      }
      
      if (identity.provider.toLowerCase() === 'github') {
        const username = getGitHubUsername(identity);
                        
        if (username) {
          name = username;
          console.log('Updated display name to GitHub username:', username);
        } else if (identity.identity_data.full_name || identity.identity_data.name) {
          name = identity.identity_data.full_name || identity.identity_data.name;
        }
      } else {
        if (identity.identity_data.full_name || identity.identity_data.name) {
          name = identity.identity_data.full_name || identity.identity_data.name;
        }
      }
    }
    
    toast.success(`Display data updated to use ${identity.provider} profile`, {
      duration: 3000
    })
  }
  
  let isLoading = false
  let isLinkingGithub = false
  let isLinkingDiscord = false
  let isUnlinking = false
  let isSettingPreferred = false
  
  function handleGithubClick() {
    console.log('GitHub button clicked');
  }
  
  const handleLinkingError = (error: string | null | undefined) => {
    if (error) {
      toast.error(error, {
        description: 'Failed to initiate identity linking'
      })
      return
    }
  }
  
  const handleIdentityResult = async (result: any) => {
    try {
      const response = await result
      
      if (response.type === 'success') {
        const { success, url, error } = response.data
        
        if (error) {
          handleLinkingError(error)
        } else if (success && url) {
          window.location.href = url
        }
      } else if (response.type === 'failure') {
        handleLinkingError(response.data?.error || 'Unknown error')
      }
    } catch (e) {
      handleLinkingError(e instanceof Error ? e.message : 'An unexpected error occurred')
    }
  }
</script>

<svelte:head>
  <title>Profile - PokeROM Codex</title>
  <meta name="description" content="Manage your profile on PokeROM Codex" />
</svelte:head>

<div class="container py-8">
  <div class="max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold tracking-tight mb-6">Your Profile</h1>
    
    {#if showPreferredSuccess}
      <Alert class="mb-6 bg-green-50 border-green-200">
        <CheckCircle2 class="h-4 w-4 text-green-600" />
        <AlertTitle class="text-green-800">Success!</AlertTitle>
        <AlertDescription class="text-green-700">
          {preferredMessage}
        </AlertDescription>
      </Alert>
    {/if}
    
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
            <h3 class="text-sm font-medium text-muted-foreground mb-1">Primary Provider</h3>
            <p class="text-sm capitalize">{preferredProvider || provider}</p>
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
        
        <Separator />
        
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-medium">Linked Accounts</h3>
            <Badge variant="outline" class="text-xs">{identities.length} Account{identities.length !== 1 ? 's' : ''}</Badge>
          </div>
          
          <div class="space-y-3">
            {#if identities.length > 0}
              <p class="text-sm text-muted-foreground mb-2">
                You can link multiple authentication providers to your account. Use the "Use Profile" button to choose which provider's profile information to display.
              </p>
              
              {#each identities as identity}
                <div class="flex items-center justify-between p-3 rounded-lg border {preferredProvider && preferredProvider.toLowerCase() === identity.provider.toLowerCase() ? 'bg-muted/50 border-primary/20' : ''}">
                  <div class="flex items-center gap-2">
                    {#if getProviderIcon(identity.provider)}
                      <div class={`p-1.5 rounded-md ${getProviderColor(identity.provider)}`}>
                        <svelte:component this={getProviderIcon(identity.provider)} class="h-4 w-4" />
                      </div>
                    {/if}
                    <div>
                      <p class="text-sm font-medium capitalize">
                        {identity.provider}
                        {#if preferredProvider && preferredProvider.toLowerCase() === identity.provider.toLowerCase()}
                          <Badge variant="outline" class="ml-2 text-xs">Current Display</Badge>
                        {/if}
                      </p>
                      <p class="text-xs text-muted-foreground">
                        {identity.identity_data?.email || 'No email'} 
                        {#if identity.identity_data?.full_name}
                          · {identity.identity_data.full_name}
                        {/if}
                      </p>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    {#if identities.length > 1 && (!preferredProvider || preferredProvider.toLowerCase() !== identity.provider.toLowerCase())}
                      <form method="POST" action="?/setPreferredProvider" use:enhance={() => {
                        isSettingPreferred = true
                        return async ({ result, update }) => {
                          await update()
                          isSettingPreferred = false
                          
                          if (result.type === 'success') {
                            updateProfileDisplay(identity)
                          }
                        }
                      }}>
                        <input type="hidden" name="identityId" value={identity.id} />
                        <Button type="submit" variant="outline" size="sm" disabled={isSettingPreferred} class="text-xs">
                          <UserCircle class="h-3 w-3 mr-1" />
                          Use Profile
                        </Button>
                      </form>
                    {/if}
                    
                    {#if identities.length > 1}
                      <form method="POST" action="?/unlinkIdentity" use:enhance={() => {
                        isUnlinking = true
                        return async ({ update }) => {
                          await update()
                          isUnlinking = false
                        }
                      }}>
                        <input type="hidden" name="identityId" value={identity.id} />
                        <Button type="submit" variant="ghost" size="sm" class="h-8 w-8 p-0" disabled={isUnlinking}
                               title="Unlink this account">
                          <Trash2 class="h-4 w-4 text-destructive" />
                        </Button>
                      </form>
                    {/if}
                  </div>
                </div>
              {/each}
            {:else}
              <p class="text-sm text-muted-foreground">No linked accounts found.</p>
            {/if}
            
            <div class="flex flex-wrap gap-2 mt-4">
              {#if !identities.some(i => i.provider.toLowerCase() === 'github')}
                <form method="POST" action="?/linkGithub" use:enhance={(form) => {
                  console.log('Link GitHub form submitted');
                  isLinkingGithub = true
                  return async ({ result }) => {
                    console.log('GitHub link form submission completed', result);
                    isLinkingGithub = false
                    await handleIdentityResult(result)
                  }
                }}>
                  <Button type="submit" variant="outline" size="sm" disabled={isLinkingGithub} 
                          class="flex items-center gap-1" on:click={handleGithubClick}>
                    <Github class="h-4 w-4 mr-1" />
                    {isLinkingGithub ? 'Linking...' : 'Link GitHub'}
                  </Button>
                </form>
              {/if}
              
              {#if !identities.some(i => i.provider.toLowerCase() === 'discord')}
                <form method="POST" action="?/linkDiscord" use:enhance={(form) => {
                  console.log('Link Discord form submitted');
                  isLinkingDiscord = true
                  return async ({ result }) => {
                    console.log('Discord link form submission completed', result);
                    isLinkingDiscord = false
                    await handleIdentityResult(result)
                  }
                }}>
                  <Button type="submit" variant="outline" size="sm" disabled={isLinkingDiscord} class="flex items-center gap-1">
                    <MessageSquare class="h-4 w-4 mr-1" />
                    {isLinkingDiscord ? 'Linking...' : 'Link Discord'}
                  </Button>
                </form>
              {/if}
            </div>
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