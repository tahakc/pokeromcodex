<script lang="ts">
  import { page } from '$app/stores';
  import { generateOgMetaTags, generateJsonLd } from '$lib/services/og-image-service';
  
  export let title: string;
  export let description: string;
  export let rom: any = null;
  export let canonical: string = '';
  export let ogImage: string = '';
  export let twitterCard: string = 'summary_large_image';
  
  $: completeUrl = canonical || `${$page.url.origin}${$page.url.pathname}`;
  $: ogTags = generateOgMetaTags(rom, completeUrl);
  $: jsonLd = generateJsonLd(rom, completeUrl);
  
  $: calculatedOgImage = ogImage || (rom 
    ? `${$page.url.origin}/api/og/${rom.slug}` 
    : `${$page.url.origin}/api/og`);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={completeUrl} />
  
  <meta property="og:title" content={ogTags['og:title']} />
  <meta property="og:description" content={ogTags['og:description']} />
  <meta property="og:url" content={ogTags['og:url']} />
  <meta property="og:type" content={ogTags['og:type']} />
  <meta property="og:site_name" content={ogTags['og:site_name']} />
  <meta property="og:image" content={calculatedOgImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  
  <meta name="twitter:card" content={twitterCard} />
  <meta name="twitter:title" content={ogTags['twitter:title']} />
  <meta name="twitter:description" content={ogTags['twitter:description']} />
  <meta name="twitter:image" content={calculatedOgImage} />
  
  {@html `<script type="application/ld+json">${jsonLd}</script>`}
  
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#4F709C" />
  
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
</svelte:head> 