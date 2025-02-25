import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark' | 'system';

function createThemeStore() {
  const defaultTheme: Theme = 'system';
  const initialTheme = browser ? (localStorage.getItem('theme') as Theme || defaultTheme) : defaultTheme;
  
  const { subscribe, set, update } = writable<Theme>(initialTheme);

  return {
    subscribe,
    setTheme: (newTheme: Theme) => {
      set(newTheme);
      
      if (browser) {
        if (newTheme === 'system') {
          localStorage.removeItem('theme');
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          document.documentElement.classList.toggle('dark', systemTheme === 'dark');
        } else {
          localStorage.theme = newTheme;
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
        }
      }
    },
    toggleTheme: () => {
      update(currentTheme => {
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        if (browser) {
          localStorage.theme = newTheme;
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
        }
        
        return newTheme;
      });
    }
  };
}

export const theme = createThemeStore(); 