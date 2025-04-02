<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';

  onMount(() => {
    if (browser) {
      // Set a flag to indicate a fresh login
      localStorage.setItem('freshLogin', 'true');
    }
  });

  // Close popup and reload parent if this is a successful auth
  if ($page.data._closePopup) {
    if (window.opener) {
      window.opener.location.reload();
      window.close();
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center">
  <div class="text-center">
    <h2 class="text-xl font-semibold mb-2">Processing authentication...</h2>
    <p class="text-muted-foreground">Please wait while we complete the process.</p>
  </div>
</div>
