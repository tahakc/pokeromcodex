import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === "none" ? "" : style.transform;

	const scaleConversion = (
		valueA: number,
		scaleA: [number, number],
		scaleB: [number, number]
	) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (
		style: Record<string, number | string | undefined>
	): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, "");
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

/**
 * Optimizes an image URL by proxying it through our image optimization endpoint
 * @param url The original image URL
 * @param options Optional parameters for image optimization
 * @returns The optimized image URL
 */
export function optimizeImage(
	url: string, 
	options?: { 
		width?: number; 
		height?: number; 
		quality?: number;
		isMobile?: boolean;
	}
): string {
	if (!url) return '';
	
	// For local development or if the URL is already optimized, return as is
	if (url.includes('/api/image') || !url.includes('supabase.co')) {
		return url;
	}
	
	// Encode the URL to make it safe for query parameters
	const encodedUrl = encodeURIComponent(url);
	
	// Build the query string
	let queryParams = `url=${encodedUrl}`;
	
	// If we have a mobile flag, use mobile-specific defaults
	if (options?.isMobile) {
		// Default mobile width if not specified
		if (!options.width) {
			options.width = 640;
		}
		
		// Default mobile quality if not specified
		if (!options.quality) {
			options.quality = 75;
		}
	}
	
	// Add width if specified
	if (options?.width) {
		queryParams += `&width=${options.width}`;
	}
	
	// Add height if specified
	if (options?.height) {
		queryParams += `&height=${options.height}`;
	}
	
	// Add quality if specified
	if (options?.quality) {
		queryParams += `&quality=${options.quality}`;
	}
	
	// Return the optimized URL
	return `/api/image?${queryParams}`;
}