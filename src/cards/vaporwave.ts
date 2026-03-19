/**
 * Vaporwave Card — retro cars cruising through a sunset grid landscape.
 *
 * Visual elements:
 * - Gradient sunset sky (purple → pink → orange)
 * - Sun disc with horizontal slice lines
 * - Mountain/terrain silhouette
 * - Perspective grid road
 * - Animated cars with headlight glow driving toward horizon
 * - Palm tree silhouettes
 * - Rotating taglines in retro font style
 * - Scrolling text at bottom
 */

import type { CardConfig, CardResult, CardRenderer } from '../core/types.js';
import { escapeXml } from '../core/xml.js';

interface VaporConfig {
  name: string;
  taglines: string[];
  scrolltext?: string;
  carCount?: number;
  palette?: 'sunset' | 'midnight' | 'miami';
}

interface VaporPalette {
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  sun: string;
  sunStripe: string;
  mountain: string;
  grid: string;
  road: string;
  car: string;
  headlight: string;
  text: string;
  glow: string;
  palm: string;
}

const PALETTES: Record<string, VaporPalette> = {
  sunset: {
    skyTop: '#1a0030',
    skyMid: '#660066',
    skyBottom: '#ff6600',
    sun: '#ff4488',
    sunStripe: '#1a0030',
    mountain: '#330044',
    grid: '#ff44aa',
    road: '#220033',
    car: '#00ffff',
    headlight: '#ffff00',
    text: '#ffffff',
    glow: '#ff66aa',
    palm: '#1a0025',
  },
  midnight: {
    skyTop: '#000020',
    skyMid: '#000055',
    skyBottom: '#0022aa',
    sun: '#0066ff',
    sunStripe: '#000020',
    mountain: '#000033',
    grid: '#0044ff',
    road: '#000015',
    car: '#00ffff',
    headlight: '#ffffff',
    text: '#ccddff',
    glow: '#0088ff',
    palm: '#000018',
  },
  miami: {
    skyTop: '#ff0066',
    skyMid: '#ff6600',
    skyBottom: '#ffcc00',
    sun: '#ffff00',
    sunStripe: '#ff0066',
    mountain: '#cc0044',
    grid: '#ff0088',
    road: '#aa0044',
    car: '#00ffcc',
    headlight: '#ffffff',
    text: '#ffffff',
    glow: '#ff4488',
    palm: '#880033',
  },
};

function generateSun(cx: number, cy: number, r: number, p: VaporPalette): string {
  // Sun disc with horizontal sliced lines (vaporwave signature)
  const slices: string[] = [];
  for (let i = 0; i < 8; i++) {
    const y = cy - r + (i + 1) * (r * 2) / 9;
    const h = 2 + i * 0.8;
    slices.push(
      `<rect x="${cx - r}" y="${y.toFixed(0)}" width="${r * 2}" height="${h.toFixed(1)}" fill="${p.sunStripe}"/>`
    );
  }
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${p.sun}"/>
    <clipPath id="sunClip"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>
    <g clip-path="url(#sunClip)">
      ${slices.join('\n      ')}
    </g>`;
}

function generateMountains(w: number, horizonY: number, p: VaporPalette): string {
  // Jagged mountain range silhouette
  const points: string[] = [`0,${horizonY}`];
  const peaks = 20;
  for (let i = 0; i <= peaks; i++) {
    const x = (i / peaks) * w;
    const hash = Math.sin(i * 127.1 + 7) * 43758.5453;
    const r = hash - Math.floor(hash);
    const height = 15 + r * 55;
    points.push(`${x.toFixed(0)},${(horizonY - height).toFixed(0)}`);
  }
  points.push(`${w},${horizonY}`);
  return `<polygon points="${points.join(' ')}" fill="${p.mountain}"/>`;
}

function generateGrid(w: number, h: number, horizonY: number, p: VaporPalette): string {
  const lines: string[] = [];
  const vx = w / 2;

  // Horizontal
  for (let i = 0; i < 18; i++) {
    const t = i / 18;
    const y = horizonY + t * t * (h - horizonY);
    const opacity = Math.max(0.05, 0.6 - t * 0.4).toFixed(2);
    const width = (0.5 + t * 1.5).toFixed(1);
    lines.push(
      `<line x1="0" y1="${y.toFixed(0)}" x2="${w}" y2="${y.toFixed(0)}" stroke="${p.grid}" stroke-width="${width}" opacity="${opacity}"/>`
    );
  }

  // Vertical converging
  for (let i = -12; i <= 12; i++) {
    const bottomX = vx + i * (w / 12);
    const opacity = Math.max(0.05, 0.4 - Math.abs(i) * 0.025).toFixed(2);
    lines.push(
      `<line x1="${vx}" y1="${horizonY}" x2="${bottomX.toFixed(0)}" y2="${h}" stroke="${p.grid}" stroke-width="0.8" opacity="${opacity}"/>`
    );
  }

  // Animated grid scroll (horizontal lines moving toward viewer)
  for (let i = 0; i < 3; i++) {
    const startY = horizonY + 5;
    const endY = h;
    const dur = (2 + i * 0.5).toFixed(1);
    const delay = (i * 0.7).toFixed(1);
    lines.push(`
      <line x1="0" x2="${w}" stroke="${p.grid}" stroke-width="1.5" opacity="0">
        <animate attributeName="y1" from="${startY}" to="${endY}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="y2" from="${startY}" to="${endY}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.6;0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="stroke-width" from="0.5" to="3" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      </line>`);
  }

  return lines.join('\n    ');
}

function generateCar(x: number, y: number, scale: number, p: VaporPalette, idx: number): string {
  // Simple side-view car silhouette scaled by distance
  const s = scale;
  const dur = (4 + idx * 1.5).toFixed(1);
  const delay = (idx * 2).toFixed(1);

  // Car drives from right to left (or left to right)
  const dir = idx % 2 === 0 ? 1 : -1;
  const startX = dir > 0 ? -80 * s : 900 + 80 * s;
  const endX = dir > 0 ? 900 + 80 * s : -80 * s;

  return `
    <g opacity="0">
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.95;1" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      <!-- Car body -->
      <rect rx="${2 * s}" width="${50 * s}" height="${12 * s}" fill="${p.car}" opacity="0.9">
        <animate attributeName="x" from="${startX}" to="${endX}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="y" from="${y}" to="${y}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      </rect>
      <!-- Roof -->
      <rect rx="${2 * s}" width="${25 * s}" height="${8 * s}" fill="${p.car}" opacity="0.7">
        <animate attributeName="x" from="${startX + 10 * s * dir}" to="${endX + 10 * s * dir}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="y" from="${y - 8 * s}" to="${y - 8 * s}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      </rect>
      <!-- Headlight glow -->
      <circle r="${4 * s}" fill="${p.headlight}" opacity="0.6" filter="url(#carGlow)">
        <animate attributeName="cx" from="${dir > 0 ? startX + 50 * s : startX}" to="${dir > 0 ? endX + 50 * s : endX}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="cy" from="${y + 6 * s}" to="${y + 6 * s}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      </circle>
      <!-- Tail light -->
      <circle r="${2.5 * s}" fill="#ff0033" opacity="0.8">
        <animate attributeName="cx" from="${dir > 0 ? startX : startX + 50 * s}" to="${dir > 0 ? endX : endX + 50 * s}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="cy" from="${y + 6 * s}" to="${y + 6 * s}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      </circle>
    </g>`;
}

function generatePalmTree(x: number, baseY: number, height: number, p: VaporPalette): string {
  const topY = baseY - height;
  // Trunk
  let tree = `<line x1="${x}" y1="${baseY}" x2="${x + 3}" y2="${topY}" stroke="${p.palm}" stroke-width="4"/>`;
  // Fronds (simple arcs)
  for (let i = 0; i < 5; i++) {
    const angle = -60 + i * 30;
    const rad = (angle * Math.PI) / 180;
    const fx = x + 3 + Math.cos(rad) * 35;
    const fy = topY + Math.sin(rad) * 20 - 5;
    tree += `<path d="M ${x + 3},${topY} Q ${(x + 3 + fx) / 2},${topY - 15} ${fx.toFixed(0)},${fy.toFixed(0)}" fill="none" stroke="${p.palm}" stroke-width="3"/>`;
  }
  return tree;
}

export const vaporwaveCard: CardRenderer = {
  name: 'vaporwave',

  async render(cardConfig: CardConfig): Promise<CardResult> {
    const w = cardConfig.width ?? 900;
    const h = cardConfig.height ?? 350;
    const raw = cardConfig.config;
    const cfg: VaporConfig = {
      name: (raw['name'] as string) ?? 'V A P O R',
      taglines: (raw['taglines'] as string[]) ?? ['A E S T H E T I C'],
      scrolltext: (raw['scrolltext'] as string) ?? 'IT IS ALL A DREAM',
      carCount: (raw['carCount'] as number) ?? 4,
      palette: (raw['palette'] as VaporConfig['palette']) ?? 'sunset',
    };

    const p = PALETTES[cfg.palette ?? 'sunset'] ?? PALETTES['sunset']!;
    const horizonY = Math.round(h * 0.48);
    const sunCY = horizonY - 10;
    const sunR = 55;
    const totalTaglineDur = cfg.taglines.length * 3;

    // Cars at different depths
    const cars: string[] = [];
    for (let i = 0; i < (cfg.carCount ?? 4); i++) {
      const depth = 0.3 + (i / (cfg.carCount ?? 4)) * 0.6;
      const carY = horizonY + depth * depth * (h - horizonY - 20);
      const scale = 0.4 + depth * 0.8;
      cars.push(generateCar(0, carY, scale, p, i));
    }

    const taglines = cfg.taglines.map((tagline, i) => {
      const start = i / cfg.taglines.length;
      const end = (i + 0.85) / cfg.taglines.length;
      return `
      <text x="${w / 2}" y="${horizonY - 75}" text-anchor="middle"
            font-family="'Segoe UI', system-ui, sans-serif" font-size="18"
            fill="${p.glow}" letter-spacing="6" opacity="0">
        ${escapeXml(tagline.toUpperCase())}
        <animate attributeName="opacity" values="0;0;1;1;0;0"
                 keyTimes="0;${start.toFixed(3)};${(start + 0.02).toFixed(3)};${(end - 0.02).toFixed(3)};${end.toFixed(3)};1"
                 dur="${totalTaglineDur}s" repeatCount="indefinite"/>
      </text>`;
    }).join('');

    const scrollLen = (cfg.scrolltext ?? '').length * 9;
    const scrollDur = Math.max(10, scrollLen / 40);

    const svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"
  role="img" aria-label="${escapeXml(cfg.name)} vaporwave card">
  <style>
    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
    }
  </style>
  <defs>
    <linearGradient id="vaporSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p.skyTop}"/>
      <stop offset="50%" stop-color="${p.skyMid}"/>
      <stop offset="100%" stop-color="${p.skyBottom}"/>
    </linearGradient>
    <filter id="carGlow">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="sunGlow">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="txtGlow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <clipPath id="belowHorizon">
      <rect x="0" y="${horizonY}" width="${w}" height="${h - horizonY}"/>
    </clipPath>
  </defs>

  <!-- Sky gradient -->
  <rect width="${w}" height="${h}" rx="14" fill="url(#vaporSky)"/>

  <!-- Sun with slice lines -->
  <g filter="url(#sunGlow)">
    ${generateSun(w / 2, sunCY, sunR, p)}
  </g>

  <!-- Mountains -->
  ${generateMountains(w, horizonY, p)}

  <!-- Palm trees (silhouette) -->
  <g>
    ${generatePalmTree(60, horizonY, 80, p)}
    ${generatePalmTree(120, horizonY, 65, p)}
    ${generatePalmTree(w - 80, horizonY, 75, p)}
    ${generatePalmTree(w - 140, horizonY, 55, p)}
  </g>

  <!-- Grid floor -->
  <g clip-path="url(#belowHorizon)">
    <rect x="0" y="${horizonY}" width="${w}" height="${h - horizonY}" fill="${p.road}"/>
    ${generateGrid(w, h, horizonY, p)}
  </g>

  <!-- Cars driving -->
  <g clip-path="url(#belowHorizon)">
    ${cars.join('')}
  </g>

  <!-- Title -->
  <text x="${w / 2}" y="${horizonY - 100}" text-anchor="middle"
        font-family="'Segoe UI', system-ui, sans-serif" font-size="42" font-weight="300"
        fill="${p.text}" filter="url(#txtGlow)" letter-spacing="12">
    ${escapeXml(cfg.name)}
  </text>

  <!-- Taglines -->
  ${taglines}

  <!-- Scrolltext -->
  <text y="${h - 8}" font-family="'JetBrains Mono', monospace" font-size="10"
        fill="${p.glow}" letter-spacing="3" opacity="0.4">
    ${escapeXml(cfg.scrolltext ?? '')}
    <animate attributeName="x" from="${w + 20}" to="${-scrollLen}" dur="${scrollDur}s" repeatCount="indefinite"/>
  </text>

  <!-- Frame -->
  <rect width="${w}" height="${h}" rx="14" fill="none" stroke="${p.glow}" stroke-width="1" opacity="0.1"/>
</svg>`;

    return { svg, filename: 'vaporwave.svg', width: w, height: h };
  },
};
