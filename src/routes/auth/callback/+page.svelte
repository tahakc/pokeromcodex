<script context="module">
  // Disable server-side rendering for this page
  export const ssr = false;
</script>

<script lang="ts">
  import { toast } from '$lib/components/ui/sonner';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { Progress } from '$lib/components/ui/progress';
  import { invalidate } from '$app/navigation';
  import { browser } from '$app/environment';

  // Simple error handler that works without TypeScript errors
  function safeClientSideOperation(fn: () => void) {
    if (!browser) return; // Don't execute during SSR
    try {
      fn();
    } catch (err) {
      console.error('Client side operation failed:', err);
      // Silent failure - don't show errors to user
    }
  }

  // A more thorough approach to ensure dropdown and navbar work properly
  // Handle everything in onMount
  onMount(async () => {
    // Only run in browser
    if (!browser) return;
    
    try {
      // Extract parameters from URL
      const url = $page.url;
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');
      
      console.log("Auth callback parameters:", { error, errorDescription });
      
      // Set freshLogin flag in localStorage
      try {
        localStorage.setItem('freshLogin', 'true');
      } catch (e) {
        console.error('LocalStorage error:', e);
      }
      
      // CRITICAL FIX: Force immediate update of auth state in UI
      console.log('Forcing auth state update to refresh navbar...');
      
      // First invalidate auth state
      await invalidate('supabase:auth');
      
      // Then invalidate the app auth state
      await invalidate('app:auth');
      
      // Explicitly invalidate the layout and navigation components
      await invalidate('/');
      
      // Also invalidate the current route to force a full refresh
      await invalidate(window.location.pathname);
      
      console.log('Auth state fully invalidated, UI should update');
      
      // IMPORTANT: We need to completely replace the auth callback URL
      // Not just a client-side navigation, to ensure clean state
      if (error) {
        console.log('Auth error, replacing URL with dashboard');
        // Use window.location for a full page refresh
        window.location.href = '/dashboard';
      } else {
        console.log('Auth successful, replacing URL with dashboard');
        // Use window.location for a full page refresh
        window.location.href = '/dashboard';
      }

    } catch (e) {
      console.error('Error in auth callback (handled):', e);
      // Use window.location for a full page refresh on error too
      window.location.href = '/dashboard';
    }
  });
</script>

<!-- Super simple UI that won't cause any errors -->
<div class="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
  <div class="w-full max-w-md text-center space-y-4">
    <h1 class="text-2xl font-bold">Signing you in...</h1>
    <p class="text-muted-foreground">You will be redirected shortly.</p>
    <Progress value={75} class="w-full" />
  </div>
</div>