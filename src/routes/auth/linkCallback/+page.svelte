<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';

  let error: string | null = null;
  let provider: string | null = null;
  let success = false;

  onMount(() => {
    if (browser) {
      // Parse URL parameters
      const url = new URL(window.location.href);
      error = url.searchParams.get('error');
      provider = url.searchParams.get('provider');
      const linked = url.searchParams.get('linked') === 'true';

      // Determine if the linking was successful
      success = linked && provider !== null && !error;

      // Send message to parent window
      if (window.opener && window.opener !== window) {
        try {
          if (success) {
            // Send success message
            window.opener.postMessage({
              type: 'account-linked',
              provider: provider
            }, window.location.origin);
          } else if (error) {
            // Send error message
            window.opener.postMessage({
              type: 'account-link-error',
              error: error,
              provider: provider
            }, window.location.origin);
          }

          // Close this window after a short delay
          setTimeout(() => {
            window.close();
          }, 1000);
        } catch (e) {
          console.error('Error posting message to parent window:', e);
        }
      } else {
        console.warn('No opener window found, cannot send message');
      }
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

<div class="flex justify-center items-center h-screen">
  <div class="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
    {#if success}
      <h1 class="text-2xl font-bold text-green-600 mb-4">Account Linked Successfully!</h1>
      <p class="mb-4">Your {provider} account has been linked to your PokeROM Codex profile.</p>
      <p class="text-sm text-gray-500">This window will close automatically.</p>
    {:else if error}
      <h1 class="text-2xl font-bold text-red-600 mb-4">Error Linking Account</h1>
      <p class="mb-4">{error}</p>
      <p class="text-sm text-gray-500">This window will close automatically.</p>
    {:else}
      <h1 class="text-2xl font-bold mb-4">Processing...</h1>
      <p class="mb-4">Please wait while we complete the account linking process.</p>
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    {/if}
  </div>
</div>
