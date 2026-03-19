/**
 * Pixel City Card — 2D side-scrolling cityscape inspired by
 * SimCity, Vice City, and classic 16-bit game aesthetics.
 *
 * Features:
 * - Parallax scrolling city layers (bg/mid/fg buildings)
 * - Animated neon signs flickering
 * - Cars driving along street at bottom
 * - Streetlights with glow
 * - Pixel-art style with clean geometry
 * - Star field in sky
 */

import type { CardConfig, CardResult, CardRenderer } from '../core/types.js';
import { escapeXml } from '../core/xml.js';

interface CityConfig {
  name: string;
  taglines: string[];
  scrolltext?: string;
  palette?: 'night' | 'vice' | 'retro' | 'dawn';
}

interface CityPalette {
  sky: string;
  skyGrad: string;
  bgBuilding: string;
  midBuilding: string;
  fgBuilding: string;
  window: string;
  windowLit: string;
  neon1: string;
  neon2: string;
  neon3: string;
  street: string;
  sidewalk: string;
  car1: string;
  car2: string;
  headlight: string;
  taillight: string;
  lampPost: string;
  lampGlow: string;
  text: string;
  star: string;
}

const PALETTES: Record<string, CityPalette> = {
  night: {
    sky: '#0a0a1e', skyGrad: '#141430',
    bgBuilding: '#12122a', midBuilding: '#1a1a35', fgBuilding: '#222244',
    window: '#0a0a18', windowLit: '#ffee88',
    neon1: '#ff0066', neon2: '#00ffcc', neon3: '#ffaa00',
    street: '#1a1a22', sidewalk: '#2a2a35',
    car1: '#ff4444', car2: '#4488ff', headlight: '#ffffcc', taillight: '#ff0000',
    lampPost: '#444455', lampGlow: '#ffdd88',
    text: '#ffffff', star: '#ffffff',
  },
  vice: {
    sky: '#1a0028', skyGrad: '#330044',
    bgBuilding: '#1a0030', midBuilding: '#220040', fgBuilding: '#2a0050',
    window: '#100020', windowLit: '#ff66cc',
    neon1: '#ff00ff', neon2: '#00ffff', neon3: '#ff6600',
    street: '#180020', sidewalk: '#250035',
    car1: '#ff0088', car2: '#00ddff', headlight: '#ffffff', taillight: '#ff0044',
    lampPost: '#553366', lampGlow: '#ff88cc',
    text: '#ffffff', star: '#ff88dd',
  },
  retro: {
    sky: '#000000', skyGrad: '#000811',
    bgBuilding: '#111111', midBuilding: '#1a1a1a', fgBuilding: '#252525',
    window: '#0a0a0a', windowLit: '#00ff00',
    neon1: '#00ff00', neon2: '#00cc00', neon3: '#33ff33',
    street: '#0a0a0a', sidewalk: '#1a1a1a',
    car1: '#00ff00', car2: '#00cc00', headlight: '#00ff00', taillight: '#00aa00',
    lampPost: '#333333', lampGlow: '#00ff00',
    text: '#00ff00', star: '#00ff00',
  },
  dawn: {
    sky: '#1a1040', skyGrad: '#402060',
    bgBuilding: '#1a1035', midBuilding: '#221545', fgBuilding: '#2a1a55',
    window: '#100a25', windowLit: '#ffcc66',
    neon1: '#ff4488', neon2: '#44ddff', neon3: '#ffaa44',
    street: '#151025', sidewalk: '#201535',
    car1: '#ffaa33', car2: '#33aaff', headlight: '#ffeecc', taillight: '#ff3333',
    lampPost: '#443355', lampGlow: '#ffbb77',
    text: '#ffeedd', star: '#ffd4aa',
  },
};

function seededRandom(seed: number): number {
  const h = Math.sin(seed) * 43758.5453;
  return h - Math.floor(h);
}

function generateStars(w: number, h: number, count: number, p: CityPalette): string {
  const stars: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = seededRandom(i * 127.1) * w;
    const y = seededRandom(i * 269.5) * h * 0.35;
    const r = 0.3 + seededRandom(i * 371.7) * 1.2;
    const twinkle = seededRandom(i * 513.3) > 0.7;
    stars.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="${p.star}" opacity="0.6"${twinkle ? `>
      <animate attributeName="opacity" values="0.3;0.8;0.3" dur="${(2 + seededRandom(i * 99) * 3).toFixed(1)}s" repeatCount="indefinite"/>
    </circle` : '/'}>`);
  }
  return stars.join('\n    ');
}

interface Building {
  x: number; w: number; h: number; layer: 'bg' | 'mid' | 'fg';
  hasNeon: boolean; neonText: string; neonColor: string;
  hasAntenna: boolean; windowRows: number; windowCols: number;
}

function generateBuildings(w: number, horizonY: number, streetY: number, p: CityPalette): Building[] {
  const buildings: Building[] = [];
  const neonTexts = ['HOTEL', 'BAR', 'OPEN', 'CLUB', '24H', 'CAFE', 'SHOP', 'GYM', 'ATM', 'SPA'];
  const neonColors = [p.neon1, p.neon2, p.neon3];

  // Background layer (tall, far)
  for (let i = 0; i < 12; i++) {
    const bx = i * (w / 11) - 20 + seededRandom(i * 31 + 1) * 30;
    const bw = 40 + seededRandom(i * 37 + 2) * 50;
    const bh = 60 + seededRandom(i * 41 + 3) * 100;
    buildings.push({
      x: bx, w: bw, h: bh, layer: 'bg',
      hasNeon: false, neonText: '', neonColor: '',
      hasAntenna: seededRandom(i * 53 + 4) > 0.6,
      windowRows: Math.floor(bh / 10), windowCols: Math.floor(bw / 10),
    });
  }

  // Mid layer
  for (let i = 0; i < 10; i++) {
    const bx = i * (w / 9) - 10 + seededRandom(i * 67 + 10) * 40;
    const bw = 50 + seededRandom(i * 73 + 11) * 60;
    const bh = 50 + seededRandom(i * 79 + 12) * 80;
    buildings.push({
      x: bx, w: bw, h: bh, layer: 'mid',
      hasNeon: seededRandom(i * 83 + 13) > 0.5,
      neonText: neonTexts[i % neonTexts.length]!,
      neonColor: neonColors[i % neonColors.length]!,
      hasAntenna: seededRandom(i * 89 + 14) > 0.7,
      windowRows: Math.floor(bh / 12), windowCols: Math.floor(bw / 12),
    });
  }

  // Foreground layer (shorter, closer)
  for (let i = 0; i < 8; i++) {
    const bx = i * (w / 7) - 15 + seededRandom(i * 97 + 20) * 50;
    const bw = 60 + seededRandom(i * 101 + 21) * 70;
    const bh = 40 + seededRandom(i * 103 + 22) * 55;
    buildings.push({
      x: bx, w: bw, h: bh, layer: 'fg',
      hasNeon: seededRandom(i * 107 + 23) > 0.4,
      neonText: neonTexts[(i + 5) % neonTexts.length]!,
      neonColor: neonColors[(i + 1) % neonColors.length]!,
      hasAntenna: false,
      windowRows: Math.floor(bh / 14), windowCols: Math.floor(bw / 14),
    });
  }

  return buildings;
}

function renderBuilding(b: Building, streetY: number, p: CityPalette, idx: number): string {
  const color = b.layer === 'bg' ? p.bgBuilding : b.layer === 'mid' ? p.midBuilding : p.fgBuilding;
  const by = streetY - b.h;
  const parts: string[] = [];

  // Building body
  parts.push(`<rect x="${b.x.toFixed(0)}" y="${by.toFixed(0)}" width="${b.w.toFixed(0)}" height="${b.h.toFixed(0)}" fill="${color}"/>`);

  // Windows
  const winSize = b.layer === 'bg' ? 3 : b.layer === 'mid' ? 4 : 5;
  const winGap = b.layer === 'bg' ? 7 : b.layer === 'mid' ? 9 : 11;
  for (let row = 0; row < b.windowRows && row < 12; row++) {
    for (let col = 0; col < b.windowCols && col < 8; col++) {
      const wx = b.x + 4 + col * winGap;
      const wy = by + 4 + row * winGap;
      if (wx + winSize > b.x + b.w - 2) continue;
      const lit = seededRandom(idx * 1000 + row * 100 + col) > 0.45;
      parts.push(
        `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="${winSize}" height="${winSize}" fill="${lit ? p.windowLit : p.window}" opacity="${lit ? 0.8 : 0.4}"/>`
      );
    }
  }

  // Antenna
  if (b.hasAntenna) {
    const ax = b.x + b.w / 2;
    parts.push(`<line x1="${ax.toFixed(0)}" y1="${by.toFixed(0)}" x2="${ax.toFixed(0)}" y2="${(by - 12).toFixed(0)}" stroke="${color}" stroke-width="1.5"/>`);
    parts.push(`<circle cx="${ax.toFixed(0)}" cy="${(by - 13).toFixed(0)}" r="1.5" fill="${p.neon1}" opacity="0.8">
      <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/>
    </circle>`);
  }

  // Neon sign
  if (b.hasNeon && b.layer !== 'bg') {
    const nx = b.x + 4;
    const ny = by + 6;
    const flickerDur = (1.5 + seededRandom(idx * 777) * 2).toFixed(1);
    parts.push(`
      <text x="${(nx + 2).toFixed(0)}" y="${(ny + 8).toFixed(0)}"
            font-family="'JetBrains Mono', monospace" font-size="${b.layer === 'mid' ? 7 : 9}" font-weight="bold"
            fill="${b.neonColor}" letter-spacing="1">
        ${escapeXml(b.neonText)}
        <animate attributeName="opacity" values="0.9;0.6;0.9;0.3;0.9" dur="${flickerDur}s" repeatCount="indefinite"/>
      </text>`);
  }

  return parts.join('\n    ');
}

function generateCars(w: number, streetY: number, count: number, p: CityPalette): string {
  const cars: string[] = [];
  for (let i = 0; i < count; i++) {
    const dir = i % 2 === 0 ? 1 : -1;
    const laneY = streetY + 8 + (i % 2) * 16;
    const dur = (5 + seededRandom(i * 111) * 6).toFixed(1);
    const delay = (seededRandom(i * 222) * 5).toFixed(1);
    const startX = dir > 0 ? -60 : w + 60;
    const endX = dir > 0 ? w + 60 : -60;
    const carColor = i % 3 === 0 ? p.car1 : i % 3 === 1 ? p.car2 : p.neon3;

    cars.push(`
    <g opacity="0">
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.03;0.97;1" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      <!-- Body -->
      <rect rx="2" width="40" height="10" fill="${carColor}">
        <animate attributeName="x" from="${startX}" to="${endX}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="y" from="${laneY}" to="${laneY}" dur="0.1s" fill="freeze"/>
      </rect>
      <!-- Roof -->
      <rect rx="2" width="18" height="7" fill="${carColor}" opacity="0.8">
        <animate attributeName="x" from="${startX + (dir > 0 ? 8 : 14)}" to="${endX + (dir > 0 ? 8 : 14)}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="y" from="${laneY - 7}" to="${laneY - 7}" dur="0.1s" fill="freeze"/>
      </rect>
      <!-- Headlight -->
      <circle r="3" fill="${p.headlight}" opacity="0.7" filter="url(#lampFilter)">
        <animate attributeName="cx" from="${dir > 0 ? startX + 40 : startX}" to="${dir > 0 ? endX + 40 : endX}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="cy" from="${laneY + 5}" to="${laneY + 5}" dur="0.1s" fill="freeze"/>
      </circle>
      <!-- Taillight -->
      <circle r="2" fill="${p.taillight}" opacity="0.9">
        <animate attributeName="cx" from="${dir > 0 ? startX : startX + 40}" to="${dir > 0 ? endX : endX + 40}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="cy" from="${laneY + 5}" to="${laneY + 5}" dur="0.1s" fill="freeze"/>
      </circle>
    </g>`);
  }
  return cars.join('');
}

function generateLampPosts(w: number, streetY: number, p: CityPalette): string {
  const posts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const x = 60 + i * (w / 7);
    const postH = 35;
    posts.push(`
      <line x1="${x.toFixed(0)}" y1="${streetY.toFixed(0)}" x2="${x.toFixed(0)}" y2="${(streetY - postH).toFixed(0)}" stroke="${p.lampPost}" stroke-width="2"/>
      <line x1="${(x - 8).toFixed(0)}" y1="${(streetY - postH).toFixed(0)}" x2="${(x + 8).toFixed(0)}" y2="${(streetY - postH).toFixed(0)}" stroke="${p.lampPost}" stroke-width="2"/>
      <circle cx="${x.toFixed(0)}" cy="${(streetY - postH - 2).toFixed(0)}" r="3" fill="${p.lampGlow}" filter="url(#lampFilter)" opacity="0.8"/>
      <ellipse cx="${x.toFixed(0)}" cy="${streetY.toFixed(0)}" rx="15" ry="3" fill="${p.lampGlow}" opacity="0.08"/>`);
  }
  return posts.join('');
}

export const pixelCityCard: CardRenderer = {
  name: 'pixelcity',

  async render(cardConfig: CardConfig): Promise<CardResult> {
    const w = cardConfig.width ?? 900;
    const h = cardConfig.height ?? 350;
    const raw = cardConfig.config;
    const cfg: CityConfig = {
      name: (raw['name'] as string) ?? 'PIXEL CITY',
      taglines: (raw['taglines'] as string[]) ?? ['WELCOME TO THE CITY'],
      scrolltext: (raw['scrolltext'] as string) ?? 'CRUISING THROUGH THE NEON NIGHT',
      palette: (raw['palette'] as CityConfig['palette']) ?? 'night',
    };

    const p = PALETTES[cfg.palette ?? 'night'] ?? PALETTES['night']!;
    const streetY = Math.round(h * 0.72);
    const totalTaglineDur = cfg.taglines.length * 3;

    const buildings = generateBuildings(w, 0, streetY, p);

    const taglines = cfg.taglines.map((tl, i) => {
      const start = i / cfg.taglines.length;
      const end = (i + 0.85) / cfg.taglines.length;
      return `
      <text x="${w / 2}" y="38" text-anchor="middle"
            font-family="'JetBrains Mono', monospace" font-size="15"
            fill="${p.neon2}" letter-spacing="4" opacity="0">
        ${escapeXml(tl.toUpperCase())}
        <animate attributeName="opacity" values="0;0;1;1;0;0"
                 keyTimes="0;${start.toFixed(3)};${(start + 0.02).toFixed(3)};${(end - 0.02).toFixed(3)};${end.toFixed(3)};1"
                 dur="${totalTaglineDur}s" repeatCount="indefinite"/>
      </text>`;
    }).join('');

    const scrollLen = (cfg.scrolltext ?? '').length * 9;
    const scrollDur = Math.max(10, scrollLen / 40);

    const svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"
  role="img" aria-label="${escapeXml(cfg.name)} pixel city card">
  <style>
    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
    }
  </style>
  <defs>
    <linearGradient id="citySky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p.sky}"/>
      <stop offset="100%" stop-color="${p.skyGrad}"/>
    </linearGradient>
    <filter id="lampFilter">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="neonFilter">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Sky -->
  <rect width="${w}" height="${h}" rx="12" fill="url(#citySky)"/>

  <!-- Stars -->
  <g>
    ${generateStars(w, h, 50, p)}
  </g>

  <!-- Background buildings -->
  <g>
    ${buildings.filter(b => b.layer === 'bg').map((b, i) => renderBuilding(b, streetY, p, i)).join('\n    ')}
  </g>

  <!-- Mid buildings -->
  <g>
    ${buildings.filter(b => b.layer === 'mid').map((b, i) => renderBuilding(b, streetY, p, i + 100)).join('\n    ')}
  </g>

  <!-- Title (between mid and fg layers for depth) -->
  <text x="${w / 2}" y="${streetY - 85}" text-anchor="middle"
        font-family="'JetBrains Mono', monospace" font-size="38" font-weight="700"
        fill="${p.text}" filter="url(#neonFilter)" letter-spacing="6" opacity="0.95">
    ${escapeXml(cfg.name)}
  </text>

  <!-- Taglines -->
  ${taglines}

  <!-- Foreground buildings -->
  <g>
    ${buildings.filter(b => b.layer === 'fg').map((b, i) => renderBuilding(b, streetY, p, i + 200)).join('\n    ')}
  </g>

  <!-- Street -->
  <rect x="0" y="${streetY}" width="${w}" height="${h - streetY}" fill="${p.street}" rx="0"/>
  <!-- Sidewalk line -->
  <line x1="0" y1="${streetY}" x2="${w}" y2="${streetY}" stroke="${p.sidewalk}" stroke-width="2"/>
  <!-- Road center dashes -->
  <line x1="0" y1="${streetY + 18}" x2="${w}" y2="${streetY + 18}" stroke="${p.sidewalk}" stroke-width="1" stroke-dasharray="20,15" opacity="0.4"/>

  <!-- Lamp posts -->
  <g>
    ${generateLampPosts(w, streetY, p)}
  </g>

  <!-- Cars -->
  <g>
    ${generateCars(w, streetY, 6, p)}
  </g>

  <!-- Scrolltext -->
  <text y="${h - 6}" font-family="'JetBrains Mono', monospace" font-size="9"
        fill="${p.neon1}" letter-spacing="2" opacity="0.4">
    ${escapeXml(cfg.scrolltext ?? '')}
    <animate attributeName="x" from="${w + 20}" to="${-scrollLen}" dur="${scrollDur}s" repeatCount="indefinite"/>
  </text>

  <!-- Frame -->
  <rect width="${w}" height="${h}" rx="12" fill="none" stroke="${p.neon1}" stroke-width="1" opacity="0.1"/>
</svg>`;

    return { svg, filename: 'pixelcity.svg', width: w, height: h };
  },
};
