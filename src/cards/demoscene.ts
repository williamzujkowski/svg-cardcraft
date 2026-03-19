/**
 * Demoscene Card — procedural city skyline with grid, particles, and glow.
 * Inspired by farbrausch .theprod (fr-08).
 * Clean centered title, no scrolltext — let the visuals speak.
 */

import type { CardConfig, CardResult, CardRenderer } from '../core/types.js';
import { escapeXml } from '../core/xml.js';

interface DemosceneConfig {
  name: string;
  subtitle?: string;
  palette?: 'industrial' | 'neon' | 'amber' | 'ice';
  buildingCount?: number;
  particleCount?: number;
}

interface Palette {
  bg: string; skyTop: string; skyBottom: string;
  building: string; buildingHighlight: string;
  grid: string; text: string; glow: string; subtitle: string; particle: string;
}

const PALETTES: Record<string, Palette> = {
  industrial: { bg:'#0a0a0f', skyTop:'#0a0a1a', skyBottom:'#1a1020', building:'#151520', buildingHighlight:'#252535', grid:'#2a1a3a', text:'#ffffff', glow:'#8855ff', subtitle:'#aa88cc', particle:'#ffaa44' },
  neon: { bg:'#05000a', skyTop:'#050010', skyBottom:'#100525', building:'#0a0520', buildingHighlight:'#1a0a35', grid:'#ff00ff', text:'#ffffff', glow:'#00ffff', subtitle:'#00cccc', particle:'#00ffaa' },
  amber: { bg:'#0a0800', skyTop:'#0a0800', skyBottom:'#1a1000', building:'#151000', buildingHighlight:'#252000', grid:'#664400', text:'#ffcc00', glow:'#ffaa00', subtitle:'#cc8800', particle:'#ffdd55' },
  ice: { bg:'#000810', skyTop:'#000815', skyBottom:'#001030', building:'#001025', buildingHighlight:'#001535', grid:'#0055aa', text:'#ccddff', glow:'#4488ff', subtitle:'#6699cc', particle:'#88ccff' },
};

function seeded(i: number, s: number): number { const h = Math.sin(s + i * 127.1) * 43758.5453; return h - Math.floor(h); }

function skyline(w: number, hy: number, count: number, p: Palette): string {
  const b: string[] = [];
  for (let i = 0; i < count; i++) {
    const r = seeded(i, 42), r2 = seeded(i, 99);
    const bx = (i / count) * w - 10, bw = 15 + r * 40, bh = 40 + r2 * 120, by = hy - bh;
    b.push(`<rect x="${bx|0}" y="${by|0}" width="${bw|0}" height="${bh|0}" fill="${p.building}"/>`);
    if (bh > 50) for (let wy = by + 8; wy < hy - 5; wy += 12) for (let wx = bx + 4; wx < bx + bw - 4; wx += 8)
      if (Math.sin(wx * 7.7 + wy * 3.3 + i) > 0.3) b.push(`<rect x="${wx|0}" y="${wy|0}" width="3" height="3" fill="${p.buildingHighlight}" opacity="0.8"/>`);
    if (r > 0.7) b.push(`<line x1="${(bx+bw/2)|0}" y1="${by|0}" x2="${(bx+bw/2)|0}" y2="${(by-15-r*20)|0}" stroke="${p.buildingHighlight}" stroke-width="1"/>`);
  }
  return b.join('\n    ');
}

function grid(w: number, h: number, hy: number, p: Palette): string {
  const l: string[] = [];
  for (let i = 0; i < 12; i++) { const t = i/12, y = hy + t*t*(h-hy); l.push(`<line x1="0" y1="${y|0}" x2="${w}" y2="${y|0}" stroke="${p.grid}" stroke-width="0.5" opacity="${(0.6-t*0.5).toFixed(2)}"/>`); }
  for (let i = -8; i <= 8; i++) l.push(`<line x1="${w/2}" y1="${hy}" x2="${w/2+i*(w/8)}" y2="${h}" stroke="${p.grid}" stroke-width="0.5" opacity="${(0.4-Math.abs(i)*0.03).toFixed(2)}"/>`);
  return l.join('\n    ');
}

function particles(count: number, w: number, h: number, p: Palette): string {
  return Array.from({length: count}, (_, i) => {
    const cx = seeded(i, 1)*w, cy = seeded(i, 2)*h*0.7, sz = 0.5+seeded(i, 3)*1.5;
    const dur = (4+seeded(i, 4)*6).toFixed(1), delay = (seeded(i, 5)*5).toFixed(1);
    return `<circle cx="${cx|0}" cy="${cy|0}" r="${sz.toFixed(1)}" fill="${p.particle}" opacity="0">
      <animate attributeName="cy" from="${cy|0}" to="${(cy-30-seeded(i,6)*40)|0}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0.8;0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
    </circle>`;
  }).join('\n    ');
}

export const demosceneCard: CardRenderer = {
  name: 'demoscene',
  async render(cc: CardConfig): Promise<CardResult> {
    const w = cc.width ?? 900, h = cc.height ?? 300;
    const cfg: DemosceneConfig = { name: (cc.config['name'] as string) ?? 'DEMOSCENE', subtitle: cc.config['subtitle'] as string|undefined, palette: (cc.config['palette'] as DemosceneConfig['palette']) ?? 'industrial', buildingCount: (cc.config['buildingCount'] as number) ?? 40, particleCount: (cc.config['particleCount'] as number) ?? 60 };
    const p = PALETTES[cfg.palette ?? 'industrial']!;
    const hy = Math.round(h * 0.55);

    const svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(cfg.name)}">
  <style>@media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms!important;animation-iteration-count:1!important}}</style>
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${p.skyTop}"/><stop offset="70%" stop-color="${p.skyBottom}"/><stop offset="100%" stop-color="${p.bg}"/></linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
    <radialGradient id="hg" cx="50%" cy="100%" r="60%"><stop offset="0%" stop-color="${p.glow}" stop-opacity="0.15"/><stop offset="100%" stop-color="${p.glow}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${w}" height="${h}" rx="12" fill="url(#sky)"/>
  <rect x="0" y="${hy-60}" width="${w}" height="120" fill="url(#hg)"/>
  <g>${grid(w, h, hy, p)}</g>
  <g>${skyline(w, hy, cfg.buildingCount!, p)}</g>
  <g>${particles(cfg.particleCount!, w, h, p)}</g>
  <text x="${w/2}" y="${hy-55}" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="48" font-weight="700" fill="${p.text}" filter="url(#glow)" letter-spacing="6">${escapeXml(cfg.name)}</text>
  ${cfg.subtitle ? `<text x="${w/2}" y="${hy-20}" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="16" fill="${p.subtitle}" letter-spacing="4">${escapeXml(cfg.subtitle)}</text>` : ''}
  <rect width="${w}" height="${h}" rx="12" fill="none" stroke="${p.grid}" stroke-width="1" opacity="0.3"/>
</svg>`;
    return { svg, filename: 'demoscene.svg', width: w, height: h };
  },
};
