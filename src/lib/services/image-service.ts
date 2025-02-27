/**
 * Image service for optimizing and transforming images from Supabase storage
 */

// Standard image widths for responsive design
const STANDARD_WIDTHS = [384, 640, 768, 1024, 1280, 1536, 1920];

/**
 * Generates an optimized image URL with specified transformations
 * @param url The original Supabase image URL
 * @param width The desired width of the image
 * @param format The desired format (webp, avif, etc.)
 * @param quality The quality level (1-100)
 * @returns The transformed image URL
 */
export function getOptimizedImageUrl(
  url: string,
  width?: number,
  format: 'webp' | 'avif' | 'auto' | null = 'webp',
  quality: number = 80
): string {
  if (!url) return '';
  
  // Only process Supabase URLs
  if (!url.includes('supabase.co/storage')) {
    return url;
  }
  
  // Start building the query parameters
  const params: string[] = [];
  
  // Add width parameter if provided
  if (width) {
    params.push(`width=${width}`);
  }
  
  // Add format parameter if provided
  if (format && format !== 'auto') {
    params.push(`format=${format}`);
  }
  
  // Add quality parameter
  params.push(`quality=${quality}`);
  
  // Combine parameters with the original URL
  return params.length > 0 
    ? `${url}?${params.join('&')}`
    : url;
}

/**
 * Generates a complete srcset attribute for responsive images
 * @param url The original Supabase image URL
 * @param widths Array of widths to include in the srcset
 * @param format The desired format (webp, avif, etc.)
 * @param quality The quality level (1-100)
 * @returns A complete srcset string
 */
export function generateSrcSet(
  url: string,
  widths: number[] = STANDARD_WIDTHS,
  format: 'webp' | 'avif' | 'auto' | null = 'webp',
  quality: number = 80
): string {
  if (!url) return '';
  
  return widths
    .map(width => `${getOptimizedImageUrl(url, width, format, quality)} ${width}w`)
    .join(',\n                   ');
}

/**
 * Generates appropriate sizes attribute based on your layout
 * @param layout The layout pattern for the image (card, hero, etc.)
 * @returns A sizes attribute string
 */
export function getSizesAttribute(layout: 'card' | 'hero' | 'thumbnail' = 'card'): string {
  switch (layout) {
    case 'hero':
      return '(max-width: 640px) 100vw, 100vw';
    case 'thumbnail':
      return '(max-width: 640px) 50vw, 25vw';
    case 'card':
    default:
      return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
  }
}

/**
 * Determines if an image should have high priority loading
 * @param isHero Whether the image is a hero/featured image
 * @param isFirstInList Whether the image is the first in a list
 * @returns 'high' or 'low' for the fetchpriority attribute
 */
export function getImagePriority(isHero: boolean = false, isFirstInList: boolean = false): 'high' | 'low' {
  return isHero || isFirstInList ? 'high' : 'low';
}
