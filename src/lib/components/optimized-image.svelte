<script lang="ts">
  import { getOptimizedImageUrl, generateSrcSet, getSizesAttribute, getImagePriority } from '$lib/services/image-service';
  import { getSkeletonImageUrl } from '$lib/services/rom-service';
  
  export let src: string = '';
  export let alt: string = '';
  export let width: number | undefined = undefined;
  export let height: number | undefined = undefined;
  export let layout: 'card' | 'hero' | 'thumbnail' = 'card';
  export let className: string = '';
  export let isHero: boolean = false;
  export let isFirstInList: boolean = false;
  export let format: 'webp' | 'avif' | 'auto' | null = 'webp';
  export let quality: number = 80;
  export let widths: number[] = [384, 640, 768, 1024, 1280, 1536];
  
  // Generate optimized image URLs
  $: optimizedSrc = src ? getOptimizedImageUrl(src, width, format, quality) : getSkeletonImageUrl();
  $: srcSet = src ? generateSrcSet(src, widths, format, quality) : '';
  $: sizes = getSizesAttribute(layout);
  $: fetchPriority = getImagePriority(isHero, isFirstInList);
  
  // Default class for different layouts
  $: defaultClass = layout === 'hero' 
    ? 'absolute inset-0 h-full w-full object-cover transition-transform duration-300' 
    : layout === 'thumbnail'
      ? 'h-full w-full object-cover'
      : 'absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105';
  
  // Combine default class with any custom classes
  $: combinedClass = `${defaultClass} ${className}`.trim();
</script>

<img
  src={optimizedSrc}
  {alt}
  class={combinedClass}
  loading="lazy"
  decoding="async"
  srcset={srcSet}
  {sizes}
  fetchpriority={fetchPriority}
  width={width}
  height={height}
/>
