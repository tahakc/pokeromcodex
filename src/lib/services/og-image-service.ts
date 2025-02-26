import type { Rom } from '$lib/types';

export function generateOgImageUrl(rom: Rom & { slug?: string }, baseUrl: string): string {
  if (!rom) return `${baseUrl}/api/og`;

  const slug = rom.slug || rom.name?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  return `${baseUrl}/api/og/${slug}`;
}

export function generateOgMetaTags(rom: Rom & { slug?: string }, url: string): Record<string, string> {
  const baseUrl = url.split('/').slice(0, 3).join('/'); // Extract base URL (protocol + host)
  const ogTitle = rom ? `${rom.name} - PokeRomCodex` : 'PokeRomCodex - Pokemon ROM Hacks';
  const ogDescription = rom && rom.content && rom.content.length > 0 
    ? rom.content[0].substring(0, 160) + '...'
    : 'Explore a curated collection of the best Pokémon ROM hacks. Find detailed information, features, and download links for enhanced Pokémon adventures.';
  
  const ogImage = generateOgImageUrl(rom, baseUrl);
  
  return {
    'og:title': ogTitle,
    'og:description': ogDescription,
    'og:image': ogImage,
    'og:url': url,
    'og:type': 'website',
    'og:site_name': 'PokeRomCodex',
    'twitter:card': 'summary_large_image',
    'twitter:title': ogTitle,
    'twitter:description': ogDescription,
    'twitter:image': ogImage,
  };
}

export function generateJsonLd(rom: Rom & { slug?: string }, url: string): string {
  const baseUrl = url.split('/').slice(0, 3).join('/'); // Extract base URL (protocol + host)
  
  if (!rom) {
    // Website schema for homepage
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'PokeRomCodex',
      url: url,
      description: 'Explore a curated collection of the best Pokémon ROM hacks.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${url}?search={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    });
  }

  const slug = rom.slug || rom.name?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: rom.name,
    description: rom.content && rom.content.length > 0 ? rom.content[0] : `${rom.name} ROM hack`,
    image: rom.image || `${baseUrl}/api/og/${slug}`,
    url: url,
    author: {
      '@type': 'Person',
      name: rom.author || 'Unknown'
    },
    datePublished: rom.date_updated || undefined,
    gamePlatform: rom.console || 'Various',
    applicationCategory: 'Game',
    genre: 'RPG, Pokemon'
  });
} 