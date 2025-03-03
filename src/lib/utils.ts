import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import { browser } from "$app/environment";
import { PUBLIC_SITE_URL } from '$env/static/public';

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
	
	const {
		quality = 80,
		format = 'auto',
		fit = 'cover'
	} = options || {};
	
	if (isLocalEnvironment()) {
		return `${url}?width=${width}`;
	}
	
	const isSupabaseStorage = url.includes('supabase.co') || url.includes('supabase.in');
	
	if (isSupabaseStorage) {
		return `${PUBLIC_SITE_URL}/cdn-cgi/image/width=${width},quality=${quality},format=${format},fit=${fit}/${url}`;
	}
	
	return `${PUBLIC_SITE_URL}/cdn-cgi/image/width=${width},quality=${quality},format=${format},fit=${fit}/${url}`;
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