/**
 * Demoscene Card — inspired by farbrausch .theprod (fr-08).
 *
 * Visual elements:
 * - Procedural city skyline silhouette
 * - Animated grid/wireframe ground plane (vanishing perspective)
 * - Particle field (stars/embers rising)
 * - Glowing text with phosphor trail
 * - Sine-wave scrolltext ticker at bottom
 * - Industrial/cyberpunk color palette
 */

import type { CardConfig, CardResult, CardRenderer } from '../core/types.js';
import { escapeXml } from '../core/xml.js';

interface DemosceneConfig {
  name: string;
  taglines: string[];
  scrolltext?: string;
  palette?: 'industrial' | 'neon' | 'amber' | 'ice';
  buildingCount?: number;
  particleCount?: number;
}

interface Palette {
  bg: string;
  skyTop: string;
  skyBottom: string;
  building: string;
  buildingHighlight: string;
  grid: string;
  text: string;
  glow: string;
  scroll: string;
  particle: string;
}

const PALETTES: Record<string, Palette> = {
  industrial: {
    bg: '#0a0a0f',
    skyTop: '#0a0a1a',
    skyBottom: '#1a1020',
    building: '#151520',
    buildingHighlight: '#252535',
    grid: '#2a1a3a',
    text: '#ffffff',
    glow: '#8855ff',
    scroll: '#ff6600',
    particle: '#ffaa44',
  },
  neon: {
    bg: '#05000a',
    skyTop: '#050010',
    skyBottom: '#100525',
    building: '#0a0520',
    buildingHighlight: '#1a0a35',
    grid: '#ff00ff',
    text: '#ffffff',
    glow: '#00ffff',
    scroll: '#ff0080',
    particle: '#00ffaa',
  },
  amber: {
    bg: '#0a0800',
    skyTop: '#0a0800',
    skyBottom: '#1a1000',
    building: '#151000',
    buildingHighlight: '#252000',
    grid: '#664400',
    text: '#ffcc00',
    glow: '#ffaa00',
    scroll: '#ff8800',
    particle: '#ffdd55',
  },
  ice: {
    bg: '#000810',
    skyTop: '#000815',
    skyBottom: '#001030',
    building: '#001025',
    buildingHighlight: '#001535',
    grid: '#0055aa',
    text: '#ccddff',
    glow: '#4488ff',
    scroll: '#00aaff',
    particle: '#88ccff',
  },
};

function generateSkyline(w: number, horizonY: number, count: number, p: Palette): string {
  const buildings: string[] = [];
  const seed = 42;
  for (let i = 0; i < count; i++) {
    // Deterministic pseudo-random from seed
    const hash = Math.sin(seed + i * 127.1) * 43758.5453;
    const r = hash - Math.floor(hash);
    const hash2 = Math.sin(seed + i * 269.5) * 18372.3456;
    const r2 = hash2 - Math.floor(hash2);

    const bx = (i / count) * w - 10;
    const bw = 15 + r * 40;
    const bh = 40 + r2 * 120;
    const by = horizonY - bh;

    // Building body
    buildings.push(
      `<rect x="${bx.toFixed(0)}" y="${by.toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" fill="${p.building}"/>`
    );

    // Window lights (small glowing dots)
    if (bh > 50) {
      for (let wy = by + 8; wy < horizonY - 5; wy += 12) {
        for (let wx = bx + 4; wx < bx + bw - 4; wx += 8) {
          const lit = Math.sin(wx * 7.7 + wy * 3.3 + i) > 0.3;
          if (lit) {
            buildings.push(
              `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="3" height="3" fill="${p.buildingHighlight}" opacity="0.8"/>`
            );
          }
        }
      }
    }

    // Occasional antenna/spire
    if (r > 0.7) {
      const ax = bx + bw / 2;
      buildings.push(
        `<line x1="${ax.toFixed(0)}" y1="${by.toFixed(0)}" x2="${ax.toFixed(0)}" y2="${(by - 15 - r * 20).toFixed(0)}" stroke="${p.buildingHighlight}" stroke-width="1"/>`
      );
    }
  }
  return buildings.join('\n    ');
}

function generateGridPlane(w: number, h: number, horizonY: number, p: Palette): string {
  const lines: string[] = [];
  // Horizontal lines receding to horizon
  for (let i = 0; i < 12; i++) {
    const t = i / 12;
    const y = horizonY + t * t * (h - horizonY);
    const opacity = (0.6 - t * 0.5).toFixed(2);
    lines.push(
      `<line x1="0" y1="${y.toFixed(0)}" x2="${w}" y2="${y.toFixed(0)}" stroke="${p.grid}" stroke-width="0.5" opacity="${opacity}"/>`
    );
  }
  // Vertical lines converging to vanishing point
  const vx = w / 2;
  for (let i = -8; i <= 8; i++) {
    const bottomX = vx + i * (w / 8);
    const opacity = (0.4 - Math.abs(i) * 0.03).toFixed(2);
    lines.push(
      `<line x1="${vx.toFixed(0)}" y1="${horizonY.toFixed(0)}" x2="${bottomX.toFixed(0)}" y2="${h}" stroke="${p.grid}" stroke-width="0.5" opacity="${opacity}"/>`
    );
  }
  return lines.join('\n    ');
}

function generateParticles(count: number, w: number, h: number, p: Palette): string {
  const particles: string[] = [];
  for (let i = 0; i < count; i++) {
    const hash = Math.sin(i * 127.1 + 0.5) * 43758.5453;
    const r = hash - Math.floor(hash);
    const hash2 = Math.sin(i * 269.5 + 0.5) * 18372.3456;
    const r2 = hash2 - Math.floor(hash2);

    const cx = r * w;
    const cy = r2 * h * 0.7;
    const size = 0.5 + r * 1.5;
    const dur = (4 + r2 * 6).toFixed(1);
    const delay = (r * 5).toFixed(1);
    const drift = -30 - r2 * 40;

    particles.push(`
      <circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${size.toFixed(1)}" fill="${p.particle}" opacity="0">
        <animate attributeName="cy" from="${cy.toFixed(0)}" to="${(cy + drift).toFixed(0)}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.8;0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      </circle>`);
  }
  return particles.join('');
}

function generateScrolltext(text: string, w: number, y: number, p: Palette): string {
  // The text scrolls left across the bottom using SMIL
  const charW = 10;
  const totalW = text.length * charW;
  const dur = Math.max(15, text.length * 0.3);

  return `
    <g>
      <text y="${y}" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="12"
            fill="${p.scroll}" letter-spacing="2" opacity="0.8">
        ${escapeXml(text)}
        <animate attributeName="x" from="${w + 20}" to="${-totalW}" dur="${dur}s" repeatCount="indefinite"/>
      </text>
    </g>`;
}

export const demosceneCard: CardRenderer = {
  name: 'demoscene',

  async render(cardConfig: CardConfig): Promise<CardResult> {
    const w = cardConfig.width ?? 900;
    const h = cardConfig.height ?? 320;
    const raw = cardConfig.config;
    const cfg: DemosceneConfig = {
      name: (raw['name'] as string) ?? 'GREETINGS',
      taglines: (raw['taglines'] as string[]) ?? ['from the scene'],
      scrolltext: (raw['scrolltext'] as string) ??
        'GREETINGS TO ALL DEMOSCENERS /// CODE IS ART /// PUSH THE PIXELS /// BREAK THE LIMITS',
      palette: (raw['palette'] as DemosceneConfig['palette']) ?? 'industrial',
      buildingCount: (raw['buildingCount'] as number) ?? 40,
      particleCount: (raw['particleCount'] as number) ?? 60,
    };

    const p = PALETTES[cfg.palette ?? 'industrial'] ?? PALETTES['industrial']!;
    const horizonY = Math.round(h * 0.55);
    const totalTaglineDur = cfg.taglines.length * 3;

    // Tagline rotation via SMIL
    const taglines = cfg.taglines.map((tagline, i) => {
      const start = i / cfg.taglines.length;
      const end = (i + 0.85) / cfg.taglines.length;
      return `
      <text x="${w / 2}" y="${horizonY - 30}" text-anchor="middle"
            font-family="'JetBrains Mono', monospace" font-size="18"
            fill="${p.glow}" letter-spacing="3" opacity="0">
        ${escapeXml(tagline.toUpperCase())}
        <animate attributeName="opacity" values="0;0;1;1;0;0"
                 keyTimes="0;${start.toFixed(3)};${(start + 0.02).toFixed(3)};${(end - 0.02).toFixed(3)};${end.toFixed(3)};1"
                 dur="${totalTaglineDur}s" repeatCount="indefinite"/>
      </text>`;
    }).join('');

    const svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"
  role="img" aria-label="${escapeXml(cfg.name)} — demoscene card">
  <style>
    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
    }
  </style>
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p.skyTop}"/>
      <stop offset="70%" stop-color="${p.skyBottom}"/>
      <stop offset="100%" stop-color="${p.bg}"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <radialGradient id="horizonGlow" cx="50%" cy="100%" r="60%">
      <stop offset="0%" stop-color="${p.glow}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${p.glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Sky -->
  <rect width="${w}" height="${h}" rx="12" fill="url(#sky)"/>

  <!-- Horizon glow -->
  <rect x="0" y="${horizonY - 60}" width="${w}" height="120" fill="url(#horizonGlow)"/>

  <!-- Grid plane -->
  <g>
    ${generateGridPlane(w, h, horizonY, p)}
  </g>

  <!-- City skyline -->
  <g>
    ${generateSkyline(w, horizonY, cfg.buildingCount ?? 40, p)}
  </g>

  <!-- Particles / embers -->
  <g>
    ${generateParticles(cfg.particleCount ?? 60, w, h, p)}
  </g>

  <!-- Main title with glow -->
  <text x="${w / 2}" y="${horizonY - 70}" text-anchor="middle"
        font-family="'JetBrains Mono', 'Courier New', monospace" font-size="48" font-weight="700"
        fill="${p.text}" filter="url(#glow)" letter-spacing="4">
    ${escapeXml(cfg.name)}
  </text>

  <!-- Rotating taglines -->
  ${taglines}

  <!-- Scrolltext -->
  ${generateScrolltext(cfg.scrolltext ?? '', w, h - 12, p)}

  <!-- Frame border -->
  <rect width="${w}" height="${h}" rx="12" fill="none" stroke="${p.grid}" stroke-width="1" opacity="0.3"/>
</svg>`;

    return { svg, filename: 'demoscene.svg', width: w, height: h };
  },
};
