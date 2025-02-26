import { getRomBySlug, nameToSlug } from '$lib/services/rom-service';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

async function fetchImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.blob();
    const base64 = Buffer.from(await arrayBuffer.arrayBuffer()).toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (err) {
    console.error('Error fetching image:', err);
    return '';
  }
}

export const GET: RequestHandler = async ({ params, url }) => {
  const { slug } = params;
  
  try {
    const rom = await getRomBySlug(slug);
    
    if (!rom) {
      throw error(404, 'ROM not found');
    }
    
    
    const imageData = rom.image ? await fetchImageAsBase64(rom.image) : '';
    
    const bgColor = getBgColor(rom);
    const bgColorLight = lightenColor(bgColor, 20);
    const bgColorDark = darkenColor(bgColor, 20);
    const textColor = getContrastingTextColor(bgColor);
    const accentColor = getAccentColor(bgColor, textColor);
    const badgeColor = getBadgeColor(bgColor, textColor);
    
    const title = rom.name;
    const author = rom.author || 'Unknown Author';
    const baseGame = rom.base_game?.[0] || 'Pokemon';
    const features = rom.features?.qol || [];
    const featuresList = features.slice(0, 3).join(', ');
    const version = rom.version ? `v${rom.version}` : '';
    const status = rom.status?.[0] || '';
    const console = rom.console || '';
    const difficultyLevels = rom.features?.gameplay_difficulty || [];
    const formatDate = (dateStr: string | null | undefined): string => {
      if (!dateStr) return '';
      try {
        const [year, month, day] = dateStr.split('/');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
      } catch {
        return dateStr;
      }
    };
    const lastUpdated = formatDate(rom.date_updated);
    
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${bgColorLight}" />
            <stop offset="50%" stop-color="${bgColor}" />
            <stop offset="100%" stop-color="${bgColorDark}" />
          </linearGradient>
          
          <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${textColor}" stop-opacity="0.05" />
            <stop offset="100%" stop-color="${textColor}" stop-opacity="0.1" />
          </linearGradient>
          
          <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${badgeColor}" />
            <stop offset="100%" stop-color="${darkenColor(badgeColor, 10)}" />
          </linearGradient>
          
          <pattern id="smallGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="${textColor}" stroke-opacity="0.04" stroke-width="0.5" />
          </pattern>
          
          <clipPath id="roundedImage">
            <rect x="50" y="50" width="280" height="280" rx="20" />
          </clipPath>
          
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.25" />
          </filter>
          
          <filter id="titleGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <filter id="frosted" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
          </filter>
        </defs>
        
        <rect width="1200" height="630" fill="url(#bgGradient)" />
        
        <rect width="1200" height="630" fill="url(#smallGrid)" />
        
        <circle cx="120" cy="200" r="300" fill="${accentColor}" fill-opacity="0.07" />
        <circle cx="1000" cy="400" r="250" fill="${accentColor}" fill-opacity="0.05" />
        
        <rect x="40" y="40" width="1120" height="570" rx="28" fill="url(#cardGradient)" stroke="${textColor}" stroke-opacity="0.1" stroke-width="1" filter="url(#frosted)" />
        
        <circle cx="1100" cy="100" r="55" fill="${accentColor}" fill-opacity="0.85" />
        <circle cx="1100" cy="100" r="25" fill="${bgColor}" stroke="${textColor}" stroke-opacity="0.4" stroke-width="2" />
        <line x1="1045" y1="100" x2="1075" y2="100" stroke="${textColor}" stroke-opacity="0.4" stroke-width="2.5" />
        <line x1="1125" y1="100" x2="1155" y2="100" stroke="${textColor}" stroke-opacity="0.4" stroke-width="2.5" />
        
        ${imageData ? 
          `<g clip-path="url(#roundedImage)">
            <image x="50" y="50" width="280" height="280" href="${escapeXml(imageData)}" preserveAspectRatio="xMidYMid slice" />
          </g>
          <rect x="50" y="50" width="280" height="280" rx="20" fill="none" stroke="${textColor}" stroke-opacity="0.15" stroke-width="1" filter="url(#shadow)" />` :
          `<rect x="50" y="50" width="280" height="280" rx="20" fill="${darkenColor(bgColor, 10)}" filter="url(#shadow)" />
           <circle cx="190" cy="190" r="45" fill="${textColor}" fill-opacity="0.2" />
           <text x="190" y="205" font-family="'Inter', system-ui, sans-serif" font-size="28" font-weight="600" text-anchor="middle" fill="${textColor}" fill-opacity="0.8">ROM</text>`
        }
        
        <text x="350" y="100" font-family="'Inter', system-ui, sans-serif" font-size="52" font-weight="800" fill="${textColor}" filter="url(#titleGlow)">
          ${escapeXml(title)}
        </text>
        
        <line x1="350" y1="125" x2="1100" y2="125" stroke="${textColor}" stroke-opacity="0.12" stroke-width="2" />
        
        <text x="350" y="170" font-family="'Inter', system-ui, sans-serif" font-size="34" font-weight="600" fill="${textColor}" fill-opacity="0.9">
          by ${escapeXml(author)}
        </text>
        
        <rect x="350" y="195" width="200" height="44" rx="22" fill="url(#badgeGradient)" stroke="${textColor}" stroke-opacity="0.15" stroke-width="1.5" filter="url(#shadow)" />
        <text x="450" y="225" font-family="'Inter', system-ui, sans-serif" font-size="20" font-weight="700" text-anchor="middle" fill="${textColor}" filter="url(#titleGlow)">
          ${escapeXml(baseGame)}
        </text>
        
        <g>
          ${version ? 
            `<rect x="570" y="195" width="100" height="44" rx="22" fill="${textColor}" fill-opacity="0.15" stroke="${textColor}" stroke-opacity="0.1" stroke-width="1" />
             <text x="620" y="225" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="700" text-anchor="middle" fill="${textColor}" filter="url(#titleGlow)">
               ${escapeXml(version)}
             </text>` : 
            ''
          }
          
          ${status ? 
            `<rect x="690" y="195" width="${status.length * 10 + 40}" height="44" rx="22" fill="${accentColor}" fill-opacity="0.2" stroke="${textColor}" stroke-opacity="0.1" stroke-width="1" />
             <text x="${690 + (status.length * 10 + 40) / 2}" y="225" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="700" text-anchor="middle" fill="${textColor}" filter="url(#titleGlow)">
               ${escapeXml(status)}
             </text>` : 
            ''
          }
        </g>
        
        <g>
          <rect x="350" y="260" width="700" height="180" rx="16" fill="${textColor}" fill-opacity="0.05" />
          
          <line x1="680" y1="275" x2="680" y2="425" stroke="${textColor}" stroke-opacity="0.1" stroke-width="1" />
          
          <text x="380" y="295" font-family="'Inter', system-ui, sans-serif" font-size="26" font-weight="700" fill="${textColor}" fill-opacity="0.85">
            Features
          </text>
          
          ${features.length > 0 ? 
            features.slice(0, 3).map((feature, index) => 
              `<text x="380" y="${335 + index * 30}" font-family="'Inter', system-ui, sans-serif" font-size="20" font-weight="500" fill="${textColor}" fill-opacity="0.75">
                • ${escapeXml(feature.length > 28 ? feature.substring(0, 28) + '...' : feature)}
               </text>`
            ).join('') : 
            `<text x="380" y="335" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="500" fill="${textColor}" fill-opacity="0.6">
              No features listed
             </text>`
          }
          
          <text x="710" y="295" font-family="'Inter', system-ui, sans-serif" font-size="26" font-weight="700" fill="${textColor}" fill-opacity="0.85">
            Details
          </text>
          
          ${console ? 
            `<text x="710" y="335" font-family="'Inter', system-ui, sans-serif" font-size="20" font-weight="500" fill="${textColor}" fill-opacity="0.75">
               Console: ${escapeXml(console)}
             </text>` : 
            ''
          }
          
          ${lastUpdated ? 
            `<text x="710" y="370" font-family="'Inter', system-ui, sans-serif" font-size="20" font-weight="500" fill="${textColor}" fill-opacity="0.75">
               Updated: ${escapeXml(lastUpdated)}
             </text>` : 
            ''
          }
          
          ${version ? 
            `<text x="710" y="405" font-family="'Inter', system-ui, sans-serif" font-size="20" font-weight="500" fill="${textColor}" fill-opacity="0.75">
               Version: ${escapeXml(version)}
             </text>` : 
            ''
          }
          
          ${difficultyLevels.length > 0 ? 
            `<rect x="350" y="450" width="700" height="70" rx="16" fill="${textColor}" fill-opacity="0.05" />
             <text x="380" y="490" font-family="'Inter', system-ui, sans-serif" font-size="22" font-weight="700" fill="${textColor}" fill-opacity="0.85">
               Difficulty:
             </text>
             <g>
               ${difficultyLevels.slice(0, 2).map((difficulty, index) => {
                 const trimmedText = difficulty.length > 16 ? difficulty.substring(0, 14) + '...' : difficulty;
                 return `<rect x="${500 + index * 210}" y="470" width="190" height="40" rx="20" fill="${accentColor}" fill-opacity="0.25" stroke="${textColor}" stroke-opacity="0.1" stroke-width="1" />
                  <text x="${595 + index * 210}" y="495" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="600" text-anchor="middle" fill="${textColor}" fill-opacity="0.9">
                    ${escapeXml(trimmedText)}
                  </text>`;
               }).join('')}
               ${difficultyLevels.length > 2 ? 
                 `<rect x="${500 + 2 * 210 + 15}" y="470" width="${(difficultyLevels.length - 2).toString().length > 1 ? 100 : 90}" height="40" rx="20" fill="${textColor}" fill-opacity="0.1" stroke="${textColor}" stroke-opacity="0.05" stroke-width="1" />
                  <text x="${500 + 2 * 210 + 15 + ((difficultyLevels.length - 2).toString().length > 1 ? 100 : 90)/2}" y="495" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="600" text-anchor="middle" fill="${textColor}" fill-opacity="0.75">
                    +${difficultyLevels.length - 2} more
                  </text>` : 
                 ''
               }
             </g>` : 
            ''
          }
        </g>
        
        <rect x="40" y="560" width="1120" height="50" rx="20" fill="${textColor}" fill-opacity="0.1" filter="url(#shadow)" />
        
        <circle cx="80" cy="585" r="16" fill="${accentColor}" fill-opacity="0.85" />
        <circle cx="80" cy="585" r="7" fill="${bgColor}" stroke="${textColor}" stroke-opacity="0.5" stroke-width="1.5" />
        <line x1="64" y1="585" x2="70" y2="585" stroke="${textColor}" stroke-opacity="0.5" stroke-width="1.5" />
        <line x1="90" y1="585" x2="96" y2="585" stroke="${textColor}" stroke-opacity="0.5" stroke-width="1.5" />
        
        <text x="115" y="591" font-family="'Inter', system-ui, sans-serif" font-size="20" font-weight="600" fill="${textColor}">
          PokeRomCodex - Discover the Best Pokemon ROM Hacks
        </text>
      </svg>
    `;
    
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400'
      }
    });
  } catch (err) {
    console.error('Error generating OG image:', err);
    
    const fallbackSvg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#8B5CF6" />
            <stop offset="50%" stop-color="#6D28D9" />
            <stop offset="100%" stop-color="#4C1D95" />
          </linearGradient>
          <pattern id="smallGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" stroke-opacity="0.04" stroke-width="0.5" />
          </pattern>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.3" />
          </filter>
        </defs>
        
        <rect width="1200" height="630" fill="url(#bgGradient)" />
        <rect width="1200" height="630" fill="url(#smallGrid)" />
        
        <circle cx="250" cy="200" r="300" fill="#A78BFA" fill-opacity="0.15" />
        <circle cx="1000" cy="400" r="280" fill="#8B5CF6" fill-opacity="0.1" />
        
        <rect x="60" y="50" width="1080" height="530" rx="28" fill="white" fill-opacity="0.07" stroke="white" stroke-opacity="0.12" stroke-width="1" />
        
        <circle cx="600" cy="280" r="120" fill="white" fill-opacity="0.1" />
        <circle cx="600" cy="280" r="50" fill="white" fill-opacity="0.05" stroke="white" stroke-opacity="0.2" stroke-width="2" />
        <line x1="480" y1="280" x2="530" y2="280" stroke="white" stroke-opacity="0.2" stroke-width="3" />
        <line x1="670" y1="280" x2="720" y2="280" stroke="white" stroke-opacity="0.2" stroke-width="3" />
        
        <rect x="120" y="215" width="960" height="240" rx="20" fill="white" fill-opacity="0.06" filter="url(#shadow)" />
        
        <text x="600" y="310" font-family="'Inter', system-ui, sans-serif" font-size="86" font-weight="800" text-anchor="middle" fill="white" filter="url(#glow)">
          PokeRomCodex
        </text>
        
        <text x="600" y="380" font-family="'Inter', system-ui, sans-serif" font-size="34" font-weight="600" text-anchor="middle" fill="white" fill-opacity="0.92">
          Discover the Best Pokemon ROM Hacks
        </text>
      </svg>
    `;
    
    return new Response(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400'
      }
    });
  }
};

function getBgColor(rom: any): string {
  const baseGame = rom.base_game?.[0]?.toLowerCase() || '';
  
  if (baseGame.includes('fire')) return '#EF4444';
  if (baseGame.includes('leaf')) return '#10B981';
  if (baseGame.includes('emerald')) return '#059669';
  if (baseGame.includes('ruby')) return '#DC2626';
  if (baseGame.includes('sapphire')) return '#2563EB';
  if (baseGame.includes('diamond')) return '#7DD3FC';
  if (baseGame.includes('pearl')) return '#EC4899';
  if (baseGame.includes('platinum')) return '#64748B';
  if (baseGame.includes('gold')) return '#F59E0B';
  if (baseGame.includes('silver')) return '#94A3B8';
  if (baseGame.includes('crystal')) return '#0EA5E9';
  if (baseGame.includes('black')) return '#1E293B';
  if (baseGame.includes('white')) return '#F8FAFC';
  
  return '#6D28D9';
}

function getContrastingTextColor(bgColor: string): string {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128 ? '#0F172A' : '#FFFFFF';
}

function getAccentColor(bgColor: string, textColor: string): string {
  if (textColor === '#FFFFFF') {
    return lightenColor(bgColor, 30);
  } else {
    return darkenColor(bgColor, 20);
  }
}

function lightenColor(color: string, percent: number): string {
  return shadeColor(color, percent);
}

function darkenColor(color: string, percent: number): string {
  return shadeColor(color, -percent);
}

function shadeColor(color: string, percent: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const calculateShade = (value: number): number => {
    return Math.round(Math.min(Math.max(0, value + (value * percent / 100)), 255));
  };

  const rr = calculateShade(r).toString(16).padStart(2, '0');
  const gg = calculateShade(g).toString(16).padStart(2, '0');
  const bb = calculateShade(b).toString(16).padStart(2, '0');

  return `#${rr}${gg}${bb}`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function getBadgeColor(bgColor: string, textColor: string): string {
  if (textColor === '#FFFFFF') {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const [h, s, l] = rgbToHsl(r, g, b);
    
    if ((h >= 350 || h <= 15) && s > 50) {
      return '#9B2C2C';
    }
    
    if (h >= 100 && h <= 150) {
      return '#20A090';
    }
    
    if (h >= 180 && h <= 250) {
      return '#D4A338';
    }
    
    const newHue = (h + 30) % 360;
    return hslToHex(newHue, Math.min(s + 15, 85), Math.min(l - 15, 50));
  } else {
    return '#6D28D9';
  }
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h = Math.round(h * 60);
  }
  
  s = Math.round(s * 100);
  const lightness = Math.round(l * 100);
  
  return [h, s, lightness];
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
} 