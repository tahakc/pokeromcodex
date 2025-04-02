<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { Loader2, CheckCircle, XCircle } from 'lucide-svelte';
  import { goto } from '$app/navigation';

  let error: string | null = null;
  let provider: string | null = null;
  let success = false;
  let mounted = false;

  onMount(() => {
    mounted = true;

    // If we're being redirected from the server, we don't need to check anything
    // The linkCallback page server will handle the redirect
    
    // This is a fallback if for some reason we end up rendering this page
    // It will redirect to profile after a short delay
    setTimeout(() => {
      goto('/profile?linked=true');
    }, 2000);
  });
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-background to-secondary/10">
  <div class="text-center px-4 py-10 sm:px-6 sm:py-16 md:px-8 rounded-lg bg-card shadow-sm border max-w-md w-full">
    <div class="flex justify-center mb-6">
      <Loader2 class="h-12 w-12 animate-spin text-primary" />
    </div>
    <h2 class="text-2xl font-semibold mb-3">Linking your account...</h2>
    <p class="text-muted-foreground mb-6">Please wait while we complete the account linking process.</p>
    <div class="w-full bg-muted rounded-full h-1.5 overflow-hidden">
      <div class="bg-primary h-1.5 rounded-full animate-pulse" style="width: 70%"></div>
    </div>
  </div>
</div>
