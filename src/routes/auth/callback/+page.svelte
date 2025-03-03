<script lang="ts">
  import { toast } from 'svelte-sonner';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { Progress } from '$lib/components/ui/progress';

  onMount(() => {
    const url = $page.url;
    console.log("Auth callback URL parameters:", Object.fromEntries(url.searchParams.entries()));
    
    let error = url.searchParams.get('error');
    let errorCode = url.searchParams.get('error_code');
    let errorDescription = url.searchParams.get('error_description');
    
    if (!error && url.hash) {
      const hashParams = new URLSearchParams(url.hash.substring(1));
      error = error || hashParams.get('error');
      errorCode = errorCode || hashParams.get('error_code');
      errorDescription = errorDescription || hashParams.get('error_description');
      console.log("Hash parameters:", Object.fromEntries(hashParams.entries()));
    }
    
    console.log("Processing auth callback:", { error, errorCode, errorDescription });
    
    if (error) {
      let errorMessage = errorDescription || error;
      
      console.log("Showing auth error toast:", errorMessage);
      setTimeout(() => {
        toast.error(errorMessage, {
          description: 'The authentication process encountered an error'
        });
        setTimeout(() => {
          goto('/profile');
        }, 500);
      }, 500);
    } else {
      // Automatically redirect to profile on successful sign-in
      setTimeout(() => {
        goto('/profile');
      }, 1000);
    }
  });
</script>

<div class="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
  <div class="w-full max-w-md text-center space-y-4">
    <h1 class="text-2xl font-bold">Signing you in...</h1>
    <p class="text-muted-foreground">Please wait while we complete the authentication process.</p>
    <Progress value={75} class="w-full" />
  </div>
</div> 