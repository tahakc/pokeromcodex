<script lang="ts">
  import { page } from '$app/stores'
  import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
  import { Button } from '$lib/components/ui/button'
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card'
  import { Separator } from '$lib/components/ui/separator'
  import { enhance } from '$app/forms'
  import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert'
  import { AlertCircle, Unlink } from 'lucide-svelte'
  import { onMount } from 'svelte'
  import { toast } from '$lib/components/ui/sonner'
  import { browser } from '$app/environment'
  import GithubIcon from '~icons/mdi/github'
  import DiscordIcon from '~icons/fa-brands/discord'
  import type { UserIdentity } from '@supabase/supabase-js'

  // Define the type for the data prop
  interface ProfileData {
    identities: UserIdentity[];
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
      localStorage.removeItem('freshLogin');

      // Check if user object is available
      if (!user) {
        window.location.reload();
      } else {
        toast.success('Successfully signed in!');
      }
    }
  });

  const user = $page.data.user
  // Determine the actual provider the user is logged in with
  // We need to examine multiple sources to get the correct provider
  let primaryProvider = 'Unknown'

  console.log('===== PROVIDER DETECTION DEBUG =====')
  console.log('User:', user)
  console.log('App metadata:', user?.app_metadata)
  console.log('User metadata:', user?.user_metadata)
  console.log('Identities:', data.identities)

  // IMPORTANT: Check URL parameter first for just-completed OAuth logins
  // This overrides all other detection methods for fresh logins/links
  const urlProvider = $page.url.searchParams.get('provider')
  if (urlProvider && ['github', 'discord'].includes(urlProvider.toLowerCase())) {
    primaryProvider = urlProvider.toLowerCase()
    console.log('Primary provider from URL parameter (highest priority):', primaryProvider)
  }
  // Try to detect most recently used provider from avatar URL
  // This is more reliable than app_metadata for determining CURRENT provider
  else if (user?.user_metadata?.avatar_url) {
    const avatarUrl = user.user_metadata.avatar_url.toLowerCase()
    if (avatarUrl.includes('github')) {
      primaryProvider = 'github'
      console.log('Primary provider from GitHub avatar:', primaryProvider)
    } else if (avatarUrl.includes('discord') || avatarUrl.includes('cdn.discordapp.com')) {
      primaryProvider = 'discord'
      console.log('Primary provider from Discord avatar:', primaryProvider)
    }
  }
  // Next check other user_metadata clues
  else if (user?.user_metadata) {
    // Check for GitHub specific metadata
    if (user.user_metadata.user_name ||
        user.user_metadata.preferred_username ||
        user.user_metadata.iss === 'https://api.github.com') {
      primaryProvider = 'github'
      console.log('Primary provider from GitHub metadata:', primaryProvider)
    }
    // Check for Discord specific metadata
    else if (user.user_metadata.custom_claims?.global_name ||
             user.user_metadata.provider === 'discord') {
      primaryProvider = 'discord'
      console.log('Primary provider from Discord metadata:', primaryProvider)
    }
  }

  // If still unknown, try identities array - find most recently updated one
  if (primaryProvider === 'Unknown' && data.identities && Array.isArray(data.identities) && data.identities.length > 0) {
    // Sort identities by updated_at to find most recent login
    const sortedIdentities = [...data.identities].sort((a, b) => {
      const dateA = new Date(a.updated_at || 0)
      const dateB = new Date(b.updated_at || 0)
      return dateB.getTime() - dateA.getTime() // Descending order (most recent first)
    })

    // Use the most recently updated identity
    primaryProvider = sortedIdentities[0].provider.toLowerCase()
    console.log('Primary provider from most recent identity:', primaryProvider, 'updated at', sortedIdentities[0].updated_at)
  }

  // Last resort, fall back to app_metadata.provider
  // This is often stale and doesn't reflect the current login provider
  if (primaryProvider === 'Unknown' && user?.app_metadata?.provider) {
    primaryProvider = user.app_metadata.provider.toLowerCase()
    console.log('Primary provider from app_metadata (fallback):', primaryProvider)
  }

  console.log('FINAL PRIMARY PROVIDER:', primaryProvider)
  console.log('===== END DEBUG =====')


  const email = user?.email || 'No email provided'

  // Determine all linked providers
  const linkedProviders = new Set<string>()

  // Add the primary provider
  linkedProviders.add(primaryProvider.toLowerCase())

  // Add any linked identities
  if (data.identities && Array.isArray(data.identities)) {
    data.identities.forEach(identity => {
      linkedProviders.add(identity.provider.toLowerCase())
    })
  }

  // Check if each provider is already linked
  let isGithubLinked = linkedProviders.has('github')
  let isDiscordLinked = linkedProviders.has('discord')

  // Get information from the primary provider (the one used to log in)
  // This ensures we don't replace the user's primary identity when linking accounts

  // Function to find primary identity data based on the primary provider
  const getPrimaryIdentityData = () => {
    if (!data.identities || !Array.isArray(data.identities) || data.identities.length === 0) {
      return null;
    }

    // Find the identity that matches the primary provider
    const primaryIdentity = data.identities.find(
      identity => identity.provider.toLowerCase() === primaryProvider
    );

    return primaryIdentity?.identity_data || null;
  }

  // Function to capitalize the first letter of a string
  const capitalizeFirstLetter = (str: string) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Get primary identity data
  const primaryIdentityData = getPrimaryIdentityData();
  console.log('Primary identity data:', primaryIdentityData);

  // Initialize avatar and name, prefer data from the primary identity
  let avatarUrl;
  let name;

  // First try to get information from the primary identity
  if (primaryProvider === 'github') {
    // For GitHub users, use their GitHub profile info
    const githubName = primaryIdentityData?.full_name ||
                       primaryIdentityData?.name ||
                       primaryIdentityData?.user_name ||
                       user?.user_metadata?.full_name ||
                       user?.user_metadata?.name;
    name = capitalizeFirstLetter(githubName || 'User');
    avatarUrl = primaryIdentityData?.avatar_url || user?.user_metadata?.avatar_url;
  } else if (primaryProvider === 'discord') {
    // For Discord users, use their Discord profile info
    const discordName = primaryIdentityData?.global_name ||
                        primaryIdentityData?.full_name ||
                        primaryIdentityData?.name ||
                        user?.user_metadata?.full_name ||
                        user?.user_metadata?.name;
    name = capitalizeFirstLetter(discordName || 'User');
    avatarUrl = primaryIdentityData?.avatar_url || user?.user_metadata?.avatar_url;
  } else {
    // Fallback to user metadata
    name = capitalizeFirstLetter(user?.user_metadata?.full_name || user?.user_metadata?.name || 'User');
    avatarUrl = user?.user_metadata?.avatar_url;
  }

  console.log('Using profile information:', {name, avatarUrl, primaryProvider});

  // Function to extract GitHub username if GitHub is the provider - not used now but kept for reference
  const getGitHubUsername = (userData: any) => {
    if (!userData?.identities) return null;

    const githubIdentity = userData.identities.find(
      (identity: UserIdentity) => identity.provider.toLowerCase() === 'github'
    );

    if (!githubIdentity?.identity_data) return null;

    return githubIdentity.identity_data.user_name ||
           githubIdentity.identity_data.username ||
           githubIdentity.identity_data.preferred_username ||
           githubIdentity.identity_data.login ||
           githubIdentity.identity_data.nickname ||
           null;
  }

  // Name is already capitalized at initialization

  let errorToastShown = false
  let error: string | null = null
  let errorCode: string | null = null
  let errorDescription: string | null = null
  let linkSuccess: string | null = null
  let alreadyLinked: string | null = null
  let isLoading = false
  let isLinking = false
  let oauthUrl = ''

  const showErrorToast = (message: string, delay = 1000) => {
    setTimeout(() => {
      toast.error(message, {
        description: 'Authentication error',
        duration: 8000,
      })
      errorToastShown = true
    }, delay)
  }

  const showSuccessToast = (message: string, description: string, delay = 1000) => {
    setTimeout(() => {
      toast.success(message, {
        description,
        duration: 5000,
      })
    }, delay)
  }

  onMount(() => {
    const url = $page.url
    error = url.searchParams.get('error')
    errorCode = url.searchParams.get('error_code')
    errorDescription = url.searchParams.get('error_description')
    linkSuccess = url.searchParams.get('link_success')
    alreadyLinked = url.searchParams.get('already_linked')

    // Check if we've just completed an OAuth linking flow
    const linked = url.searchParams.get('linked')
    const provider = url.searchParams.get('provider')

    if (linked === 'true' && provider) {
      console.log(`Account linking completed for ${provider}`)
      // Show success message
      showSuccessToast(
        'Account linked successfully',
        `Your ${provider} account has been linked to your profile`
      )

      // Refresh the page data to show updated linked accounts
      setTimeout(() => {
        window.location.href = '/profile'
      }, 1000)
    }

    if (!error && url.hash) {
      const hashParams = new URLSearchParams(url.hash.substring(1))
      error = error || hashParams.get('error')
      errorCode = errorCode || hashParams.get('error_code')
      errorDescription = errorDescription || hashParams.get('error_description')
    }

    if (error) {
      let errorMessage = errorDescription || error

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const getProviderIcon = (providerName: string) => {
    switch (providerName.toLowerCase()) {
      case 'github':
        return GithubIcon
      case 'discord':
        return DiscordIcon
      default:
        return null
    }
  }

  const getProviderColor = (providerName: string) => {
    switch (providerName.toLowerCase()) {
      case 'github':
        return 'bg-black text-white'
      case 'discord':
        return 'bg-indigo-600 hover:bg-indigo-700 text-white'
      default:
        return 'bg-primary text-primary-foreground'
    }
  }
  // Function to redirect to OAuth provider
  const openOAuthPopup = async (provider: string) => {
    try {
      isLinking = true
      console.log(`Starting OAuth flow for ${provider}`)

      // Show a toast to indicate we're processing
      toast.info('Processing', { description: `Preparing to link ${provider} account...` })

      // Instead of manually constructing the URL, use the server action to get it
      const formData = new FormData()
      formData.append('provider', provider)

      console.log('Sending request to get OAuth URL')
      const response = await fetch('/profile?/getOAuthUrl', {
        method: 'POST',
        body: formData
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        console.error('Failed to get OAuth URL, status:', response.status)
        toast.error('Error', { description: `Failed to get OAuth URL (${response.status})` })
        isLinking = false
        return
      }
      // Log the response for debugging
      console.log('OAuth URL response:', response)
      const result = await response.json()
      console.log('OAuth URL result:', result)

      // Handle the response based on its structure
      if (result && result.data) {
        try {
          if (typeof result.data === 'string') {
            // The data is a string containing JSON
            // From the logs, we can see it's an array with the URL at index 2
            const parsedData = JSON.parse(result.data)
            console.log('Parsed data:', parsedData)

            // Extract the URL directly from index 2 of the array
            oauthUrl = parsedData[2]
            console.log('OAuth URL from parsed data:', oauthUrl)

            if (!oauthUrl) {
              throw new Error('URL not found in parsed response')
            }
          } else if (result.data.url) {
            // If data contains a url property directly
            oauthUrl = result.data.url
            console.log('OAuth URL from data.url:', oauthUrl)
          }

          if (oauthUrl) {
            console.log('Successfully got OAuth URL, redirecting directly')
            // Store the provider being linked for reference
            localStorage.setItem('linking_provider', provider)
            // Redirect directly to the OAuth URL instead of opening a popup
            window.location.href = oauthUrl
          } else {
            throw new Error('Could not extract OAuth URL from response')
          }
        } catch (error) {
          console.error('Error extracting OAuth URL:', error)
          toast.error('Error', { description: 'Could not process OAuth URL' })
          isLinking = false
          return
        }
      } else {
        console.error('Invalid OAuth response format:', result)
        toast.error('Error', { description: 'Invalid response from server' })
        isLinking = false
        return
      }

      // This code is unreachable now that we're using openPopupWindow
      // Keeping it commented for reference
      /*
      // This section has been moved to the openPopupWindow function
      */
    } catch (error) {
      toast.error('Error', { description: 'Failed to start account linking' })
      isLinking = false
    }
  }

  onMount(() => {
    if (browser) {
      window.addEventListener('message', (event) => {
        // Make sure message is from our domain
        if (event.origin !== window.location.origin) return

        if (event.data.type === 'account-linked') {
          toast.success('Account linked', {
            description: `Your ${event.data.provider} account was successfully linked`
          })
        }
      })

      // Check URL parameters for success message
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('linked') === 'true') {
        const provider = urlParams.get('provider')
        if (provider) {
          toast.success('Account linked', {
            description: `Your ${provider} account was successfully linked`
          })
        }
      }
    }
  })
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
                    on:click={() => openOAuthPopup('github')}
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
                    on:click={() => openOAuthPopup('discord')}
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
