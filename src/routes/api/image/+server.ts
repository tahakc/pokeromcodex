import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dev } from '$app/environment';
import sharp from 'sharp';

// Simple in-memory cache for production
const imageCache = new Map<string, { buffer: Buffer; contentType: string; timestamp: number }>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const MAX_CACHE_SIZE = 500; // Maximum number of images to cache

// Helper to clean old cache entries
function cleanCache() {
  if (imageCache.size > MAX_CACHE_SIZE) {
    // Sort by timestamp and remove oldest entries
    const entries = [...imageCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, Math.floor(MAX_CACHE_SIZE / 5)); // Remove oldest 20%
    
    for (const [key] of toRemove) {
      imageCache.delete(key);
    }
  }
}

export const GET: RequestHandler = async ({ url, fetch, setHeaders }) => {
  try {
    // Get parameters
    const imageUrl = url.searchParams.get('url');
    const widthParam = url.searchParams.get('width');
    const heightParam = url.searchParams.get('height');
    const quality = parseInt(url.searchParams.get('quality') || '80', 10);
    
    if (!imageUrl) {
      throw error(400, 'Missing image URL');
    }
    
    // Parse width and height
    const width = widthParam ? parseInt(widthParam, 10) : undefined;
    const height = heightParam ? parseInt(heightParam, 10) : undefined;
    
    // Create a cache key based on the URL and resize parameters
    const cacheKey = `${imageUrl}_w${width || 'auto'}_h${height || 'auto'}_q${quality}`;
    
    // Check cache first (only in production)
    if (!dev && imageCache.has(cacheKey)) {
      const cached = imageCache.get(cacheKey)!;
      const now = Date.now();
      
      // If cache is still valid
      if (now - cached.timestamp < CACHE_DURATION) {
        setHeaders({
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=604800, immutable',
          'X-Cache': 'HIT'
        });
        
        return new Response(cached.buffer);
      } else {
        // Remove expired cache entry
        imageCache.delete(cacheKey);
      }
    }
    
    // Fetch the original image
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw error(response.status, 'Failed to fetch image');
    }
    
    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    const originalBuffer = Buffer.from(await response.arrayBuffer());
    
    // Process the image with Sharp
    let sharpInstance = sharp(originalBuffer);
    
    // Resize if width or height is specified
    if (width || height) {
      sharpInstance = sharpInstance.resize({
        width,
        height,
        fit: 'cover',
        position: 'centre'
      });
    }
    
    // Determine output format based on content type
    let outputOptions = {};
    let outputFormat: 'jpeg' | 'png' | 'webp' = 'jpeg';
    
    if (contentType.includes('png')) {
      outputFormat = 'png';
      outputOptions = { quality };
    } else if (contentType.includes('webp')) {
      outputFormat = 'webp';
      outputOptions = { quality };
    } else {
      // Default to JPEG
      outputFormat = 'jpeg';
      outputOptions = { quality, mozjpeg: true };
    }
    
    // Process the image
    const processedBuffer = await sharpInstance[outputFormat](outputOptions).toBuffer();
    
    // Store in cache (only in production)
    if (!dev) {
      imageCache.set(cacheKey, {
        buffer: processedBuffer,
        contentType: `image/${outputFormat}`,
        timestamp: Date.now()
      });
      
      // Clean cache if needed
      cleanCache();
    }
    
    // Set cache headers
    setHeaders({
      'Content-Type': `image/${outputFormat}`,
      'Cache-Control': 'public, max-age=604800, immutable',
      'X-Cache': 'MISS'
    });
    
    return new Response(processedBuffer);
  } catch (err) {
    console.error('Image optimization error:', err);
    throw error(500, 'Image optimization failed');
  }
}; 