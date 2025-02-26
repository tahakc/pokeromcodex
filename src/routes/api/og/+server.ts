import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#A78BFA" />
          <stop offset="50%" stop-color="#7C3AED" />
          <stop offset="100%" stop-color="#5B21B6" />
        </linearGradient>
        
        <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="white" stop-opacity="0.07" />
          <stop offset="100%" stop-color="white" stop-opacity="0.13" />
        </linearGradient>
        
        <linearGradient id="badgeGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#9B2C2C" />
          <stop offset="100%" stop-color="#7E2323" />
        </linearGradient>
        
        <linearGradient id="badgeGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#20A090" />
          <stop offset="100%" stop-color="#178C7D" />
        </linearGradient>
        
        <linearGradient id="badgeGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#D4A338" />
          <stop offset="100%" stop-color="#BF922F" />
        </linearGradient>
        
        <pattern id="smallGrid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" stroke-opacity="0.04" stroke-width="0.5" />
        </pattern>
        
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.3" />
        </filter>
        
        <filter id="badgeShadow" x="-5%" y="-5%" width="110%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.25" />
        </filter>
        
        <filter id="frosted" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
        </filter>
        
        <filter id="noise" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise"/>
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0" result="coloredNoise"/>
          <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="textureOverlay"/>
        </filter>
      </defs>
      
      <rect width="1200" height="630" fill="url(#bgGradient)" />
      
      <rect width="1200" height="630" fill="url(#smallGrid)" />
      <rect width="1200" height="630" filter="url(#noise)" opacity="0.4" />
      
      <circle cx="250" cy="200" r="350" fill="white" fill-opacity="0.07" />
      <circle cx="1000" cy="400" r="300" fill="#8B5CF6" fill-opacity="0.15" />
      <circle cx="600" cy="520" r="200" fill="#C4B5FD" fill-opacity="0.12" />
      
      <line x1="0" y1="630" x2="1200" y2="0" stroke="white" stroke-opacity="0.05" stroke-width="10" />
      
      <rect x="60" y="50" width="1080" height="530" rx="28" fill="url(#cardGradient)" stroke="white" stroke-opacity="0.15" stroke-width="1.5" filter="url(#frosted)" />
      
      <circle cx="200" cy="200" r="140" fill="none" stroke="white" stroke-opacity="0.1" stroke-width="35" />
      <circle cx="1000" cy="480" r="100" fill="none" stroke="#A78BFA" stroke-opacity="0.15" stroke-width="25" />
      
      <circle cx="950" cy="150" r="65" fill="#C4B5FD" fill-opacity="0.9" filter="url(#shadow)" />
      <circle cx="950" cy="150" r="30" fill="#7C3AED" stroke="white" stroke-opacity="0.6" stroke-width="2.5" />
      <line x1="885" y1="150" x2="920" y2="150" stroke="white" stroke-opacity="0.6" stroke-width="2.5" />
      <line x1="980" y1="150" x2="1015" y2="150" stroke="white" stroke-opacity="0.6" stroke-width="2.5" />
      <circle cx="950" cy="150" r="68" fill="none" stroke="white" stroke-opacity="0.2" stroke-width="1.5" />
      
      <circle cx="250" cy="480" r="45" fill="#C4B5FD" fill-opacity="0.9" filter="url(#shadow)" />
      <circle cx="250" cy="480" r="18" fill="#7C3AED" stroke="white" stroke-opacity="0.6" stroke-width="2" />
      <line x1="205" y1="480" x2="232" y2="480" stroke="white" stroke-opacity="0.6" stroke-width="2.5" />
      <line x1="268" y1="480" x2="295" y2="480" stroke="white" stroke-opacity="0.6" stroke-width="2.5" />
      <circle cx="250" cy="480" r="48" fill="none" stroke="white" stroke-opacity="0.2" stroke-width="1.5" />
      
      <rect x="110" y="200" width="980" height="260" rx="24" fill="white" fill-opacity="0.08" stroke="white" stroke-opacity="0.1" stroke-width="1" filter="url(#shadow)" />
      
      <text x="600" y="300" font-family="'Inter', system-ui, sans-serif" font-size="94" font-weight="900" text-anchor="middle" fill="white" filter="url(#glow)">
        PokeRomCodex
      </text>
      
      <text x="600" y="370" font-family="'Inter', system-ui, sans-serif" font-size="38" font-weight="700" text-anchor="middle" fill="white" fill-opacity="0.95">
        Discover the Best Pokemon ROM Hacks
      </text>
      
      <g text-anchor="middle">
        <rect x="340" y="430" width="140" height="44" rx="22" fill="url(#badgeGradient1)" stroke="white" stroke-opacity="0.2" stroke-width="1.5" filter="url(#badgeShadow)" />
        <text x="410" y="460" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="700" fill="white">
          Fire Red
        </text>
        
        <rect x="495" y="430" width="180" height="44" rx="22" fill="url(#badgeGradient2)" stroke="white" stroke-opacity="0.2" stroke-width="1.5" filter="url(#badgeShadow)" />
        <text x="585" y="460" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="700" fill="white">
          Emerald
        </text>
        
        <rect x="690" y="430" width="190" height="44" rx="22" fill="url(#badgeGradient3)" stroke="white" stroke-opacity="0.2" stroke-width="1.5" filter="url(#badgeShadow)" />
        <text x="785" y="460" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="700" fill="white">
          Enhanced Games
        </text>
      </g>
      
      <rect x="60" y="530" width="1080" height="50" rx="16" fill="white" fill-opacity="0.1" stroke="white" stroke-opacity="0.1" stroke-width="1" />
      
      <text x="600" y="564" font-family="'Inter', system-ui, sans-serif" font-size="20" font-weight="600" text-anchor="middle" fill="white" fill-opacity="0.95">
        Explore a curated collection of enhanced Pokemon adventures
      </text>
    </svg>
  `;
  
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400'
    }
  });
}; 