import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const isAnyModalOpen = writable<boolean>(false);

let scrollPosition = 0;
let scrollbarWidth = 0;

export function measureScrollbarWidth(): number {
  if (!browser) return 0;
  
  if (scrollbarWidth === 0) {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);
    
    const inner = document.createElement('div');
    outer.appendChild(inner);
    
    scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    
    document.body.removeChild(outer);
  }
  
  return scrollbarWidth;
}

export function applyBodyStyles(isOpen: boolean): void {
  if (!browser) return;
  
  const html = document.documentElement;
  const body = document.body;
  
  if (isOpen) {
    scrollPosition = window.scrollY;
    
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollPosition}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.bottom = '0';
    body.style.width = '100%';
    
    const scrollbarCompensation = `${measureScrollbarWidth()}px`;
    body.style.paddingRight = scrollbarCompensation;
    
    html.classList.add('modal-open');
    body.classList.add('modal-open');
  } else {
    html.style.overflow = '';
    body.style.overflow = '';
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    body.style.bottom = '';
    body.style.width = '';
    body.style.paddingRight = '';
    
    html.classList.remove('modal-open');
    body.classList.remove('modal-open');
    
    window.scrollTo(0, scrollPosition);
  }
}

if (browser) {
  isAnyModalOpen.subscribe(applyBodyStyles);
} 