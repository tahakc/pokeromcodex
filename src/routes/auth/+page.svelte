<script lang="ts">
  import { page } from '$app/stores'
  import { Button } from '$lib/components/ui/button'
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card'
  import { Separator } from '$lib/components/ui/separator'
  import GithubIcon from '~icons/mdi/github';
  import DiscordIcon from '~icons/fa-brands/discord';
  import { enhance } from '$app/forms'

  let isLoading = false
  let error: string | undefined = $page.form?.error

  // Reset error when form state changes
  $: error = $page.form?.error

  function handleSubmit() {
    isLoading = true
    return async ({ result }: { result: { type: string, data?: { redirect?: string } } }) => {
      if (result.type === 'success' && result.data?.redirect) {
        window.location.href = result.data.redirect
        return
      }
      isLoading = false
    }
  }
</script>

<svelte:head>
  <title>Sign In - PokeROM Codex</title>
  <meta name="description" content="Sign in to PokeROM Codex to access your profile and saved content" />
</svelte:head>

<div class="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
  <div class="w-full max-w-md">
    <Card class="w-full">
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold text-center">Welcome back</CardTitle>
        <CardDescription class="text-center">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4">
        {#if error}
          <div class="text-sm text-red-500 text-center">
            {error}
          </div>
        {/if}
        <form method="POST" action="?/login" use:enhance={handleSubmit}>
          <input type="hidden" name="provider" value="github" />
          <Button type="submit" class="w-full" variant="outline" disabled={isLoading}>
            <GithubIcon class="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>
        </form>
        
        <form method="POST" action="?/login" use:enhance={handleSubmit}>
          <input type="hidden" name="provider" value="discord" />
          <Button type="submit" class="w-full" variant="outline" disabled={isLoading}>
            <DiscordIcon class="mr-2 h-4 w-4" />
            Continue with Discord
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p class="text-center text-sm text-muted-foreground w-full">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  </div>
</div>