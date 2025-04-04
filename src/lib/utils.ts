import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import { browser } from "$app/environment";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Check if the code is running in a browser environment
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
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

export function isLocalEnvironment(): boolean {
	return browser && (
		window.location.hostname === 'localhost' ||
		window.location.hostname === '127.0.0.1'
	);
}

export function getOptimizedImageUrl(
	url: string,
	width: number,
	options?: {
		quality?: number,
		format?: 'auto' | 'webp' | 'avif',
		fit?: 'cover' | 'contain' | 'fill' | 'scale-down'
	}
): string {
	if (!url) return "";

	// Check if URL is from Cloudflare (contains Supabase)
	if (url.includes('supabase.co') && url.includes('storage')) {
		// Parse the URL to get its components
		const parsedUrl = new URL(url);

		// Check if there are existing params - preserve them except for width
		const params = new URLSearchParams(parsedUrl.search);

		// Set the Cloudflare resizing parameters
		params.set('width', width.toString());
		if (options?.quality) {
			params.set('quality', options.quality.toString());
		}

		// Clear the search and set the new parameters
		parsedUrl.search = params.toString();

		// Return the transformed URL
		return parsedUrl.toString();
	}

	// For other URLs, just append the width parameter
	return `${url}?width=${width}`;
}

export function formatRomAuthors(authors: string | undefined): string {
	if (!authors) return "";
	let romAuthors = [authors]

	// rom.author can be a ["list", "of", "authors"]
	// or it can be just a plain string, so we need
	// to format it accordingly
	if (
		romAuthors.length == 1 &&
		/^\["[^"]+"(?:,\s*"[^"]+")*\]$/.test(romAuthors[0])
	) {
		// if this is a list of authors then build a list
		let authorList = romAuthors[0].slice(1,-1).split(",")
		let newAuthors: string[] = []
		authorList.forEach(e => {
			newAuthors.push(e.trim().slice(1,-1))
		});
		// then replace authors with it
		romAuthors = newAuthors
	}

	// build the final string
	let formattedAuthors = ""
	for (let i = 0; i < romAuthors.length; i++) {
		formattedAuthors += romAuthors[i]
		if (i < romAuthors.length - 1) {
			formattedAuthors += ", "
		}
	}
	return formattedAuthors
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
