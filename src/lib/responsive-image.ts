/**
 * Utility functions for responsive image handling
 */
import { getOptimizedImageUrl } from "$lib/utils";

export function getImageDimensions(aspectRatio: string = '16:9'): { width: number, height: number } {
  // Default width for primary image size
  const width = 768;
  
  // Parse aspect ratio or default to 16:9
  const [w, h] = aspectRatio.split(':').map(Number);
  const height = Math.round(width * (h / w));
  
  return { width, height };
}

export function getResponsiveImageProps(url: string, index: number = -1): { 
  src: string, 
  width: string,
  height: string,
  sizes: string 
} {
  const { width, height } = getImageDimensions();
  
  // Make sure we handle the URL correctly
  if (!url) {
    console.error('Received empty image URL');
    return {
      src: '',
      width: width.toString(),
      height: height.toString(),
      sizes: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
    };
  }
  
  // Set appropriate image sizes based on viewport
  // This ensures we load appropriately sized images for each screen size
  const responsiveWidth = index === 0 ? width : 400; // First image is LCP, so use full width
  
  return {
    src: getOptimizedImageUrl(url, responsiveWidth, { quality: 85 }),
    width: width.toString(),
    height: height.toString(),
    sizes: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
  };
}
