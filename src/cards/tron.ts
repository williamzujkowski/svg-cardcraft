/**
 * Tron Card — light cycle racers on a neon grid.
 *
 * Features:
 * - Perspective grid floor
 * - Multiple light cycles leaving glowing trails
 * - Trails animate via SMIL stroke-dashoffset
 * - Neon glow on everything
 * - Rotating taglines
 * - Scrolltext
 */

import type { CardConfig, CardResult, CardRenderer } from '../core/types.js';
import { escapeXml } from '../core/xml.js';

interface TronConfig {
  name: string;
  taglines: string[];
  scrolltext?: string;
  cycleCount?: number;
  palette?: 'classic' | 'orange' | 'white';
}

interface CycleColor {
  trail: string;
  glow: string;
  grid: string;
  bg: string;
  text: string;
  horizon: string;
}

const PALETTES: Record<string, CycleColor> = {
  classic: {
    trail: '#00d4ff',
    glow: '#00aaff',
    grid: '#003366',
    bg: '#000810',
    text: '#ffffff',
    horizon: '#001830',
  },
  orange: {
    trail: '#ff6600',
    glow: '#ff4400',
    grid: '#331100',
    bg: '#080400',
    text: '#ffffff',
    horizon: '#1a0a00',
  },
  white: {
    trail: '#ffffff',
    glow: '#aaccff',
    grid: '#1a1a2e',
    bg: '#0a0a14',
    text: '#ffffff',
    horizon: '#12121e',
  },
};

function generateGrid(w: number, h: number, horizonY: number, c: CycleColor): string {
  const lines: string[] = [];
  const vx = w / 2;

  // Horizontal lines with perspective spacing
  for (let i = 0; i < 15; i++) {
    const t = i / 15;
    const y = horizonY + t * t * (h - horizonY);
    const opacity = (0.5 - t * 0.35).toFixed(2);
    lines.push(
      `<line x1="0" y1="${y.toFixed(0)}" x2="${w}" y2="${y.toFixed(0)}" stroke="${c.grid}" stroke-width="0.8" opacity="${opacity}"/>`
    );
  }

  // Vertical lines converging
  for (let i = -10; i <= 10; i++) {
    const bottomX = vx + i * (w / 10);
    const opacity = Math.max(0.05, 0.35 - Math.abs(i) * 0.025).toFixed(2);
    lines.push(
      `<line x1="${vx.toFixed(0)}" y1="${horizonY.toFixed(0)}" x2="${bottomX.toFixed(0)}" y2="${h}" stroke="${c.grid}" stroke-width="0.8" opacity="${opacity}"/>`
    );
  }

  return lines.join('\n    ');
}

interface Cycle {
  /** Path points as "M x,y L x,y L x,y ..." */
  path: string;
  /** Total path length estimate for dash animation */
  length: number;
  /** Animation duration */
  dur: number;
  /** Start delay */
  delay: number;
  /** Color override (for multi-color cycles) */
  color: string;
  /** Glow color */
  glow: string;
}

function generateCycles(w: number, h: number, horizonY: number, count: number, c: CycleColor): Cycle[] {
  const cycles: Cycle[] = [];
  const colors = [c.trail, '#ff0044', '#ffcc00', '#00ff88', '#ff00ff', '#00ffaa'];
  const glows = [c.glow, '#cc0033', '#cc9900', '#00cc66', '#cc00cc', '#00cc88'];

  for (let i = 0; i < count; i++) {
    const hash = Math.sin(i * 127.1 + 42) * 43758.5453;
    const r = hash - Math.floor(hash);
    const hash2 = Math.sin(i * 269.5 + 42) * 18372.3456;
    const r2 = hash2 - Math.floor(hash2);
    const hash3 = Math.sin(i * 371.7 + 42) * 29471.1234;
    const r3 = hash3 - Math.floor(hash3);

    // Each cycle traces a path across the grid
    // We project 2D coordinates onto the perspective grid
    const segments: string[] = [];
    let totalLen = 0;
    const numTurns = 3 + Math.floor(r3 * 4);

    let cx = r * w;
    let cy = horizonY + 20 + r2 * (h - horizonY - 40);
    segments.push(`M ${cx.toFixed(0)},${cy.toFixed(0)}`);

    for (let t = 0; t < numTurns; t++) {
      const turnHash = Math.sin(i * 100 + t * 50) * 99999;
      const tr = turnHash - Math.floor(turnHash);

      // Alternate between horizontal and vertical moves
      let nx: number, ny: number;
      if (t % 2 === 0) {
        // Horizontal
        nx = cx + (tr > 0.5 ? 1 : -1) * (80 + tr * 200);
        ny = cy;
      } else {
        // Vertical (in perspective space)
        nx = cx;
        ny = cy + (tr > 0.5 ? 1 : -1) * (30 + tr * 80);
      }

      // Clamp to visible area
      nx = Math.max(20, Math.min(w - 20, nx));
      ny = Math.max(horizonY + 5, Math.min(h - 15, ny));

      const dx = nx - cx;
      const dy = ny - cy;
      totalLen += Math.sqrt(dx * dx + dy * dy);

      segments.push(`L ${nx.toFixed(0)},${ny.toFixed(0)}`);
      cx = nx;
      cy = ny;
    }

    cycles.push({
      path: segments.join(' '),
      length: Math.ceil(totalLen),
      dur: 3 + r * 4,
      delay: r2 * 3,
      color: colors[i % colors.length]!,
      glow: glows[i % glows.length]!,
    });
  }

  return cycles;
}

function renderCycle(cycle: Cycle, idx: number): string {
  const dashLen = cycle.length;
  return `
    <!-- Cycle ${idx} glow -->
    <path d="${cycle.path}" fill="none" stroke="${cycle.glow}" stroke-width="6"
          stroke-linecap="round" opacity="0.3" filter="url(#cycleGlow)"
          stroke-dasharray="${dashLen}" stroke-dashoffset="${dashLen}">
      <animate attributeName="stroke-dashoffset" from="${dashLen}" to="0"
               dur="${cycle.dur}s" begin="${cycle.delay}s" fill="freeze" repeatCount="indefinite"/>
    </path>
    <!-- Cycle ${idx} core -->
    <path d="${cycle.path}" fill="none" stroke="${cycle.color}" stroke-width="2"
          stroke-linecap="round"
          stroke-dasharray="${dashLen}" stroke-dashoffset="${dashLen}">
      <animate attributeName="stroke-dashoffset" from="${dashLen}" to="0"
               dur="${cycle.dur}s" begin="${cycle.delay}s" fill="freeze" repeatCount="indefinite"/>
    </path>
    <!-- Cycle ${idx} head dot -->
    <circle r="3" fill="${cycle.color}" filter="url(#cycleGlow)">
      <animateMotion dur="${cycle.dur}s" begin="${cycle.delay}s" repeatCount="indefinite" fill="freeze">
        <mpath href="#cyclePath${idx}"/>
      </animateMotion>
    </circle>
    <path id="cyclePath${idx}" d="${cycle.path}" fill="none" stroke="none"/>`;
}

export const tronCard: CardRenderer = {
  name: 'tron',

  async render(cardConfig: CardConfig): Promise<CardResult> {
    const w = cardConfig.width ?? 900;
    const h = cardConfig.height ?? 320;
    const raw = cardConfig.config;
    const cfg: TronConfig = {
      name: (raw['name'] as string) ?? 'TRON',
      taglines: (raw['taglines'] as string[]) ?? ['END OF LINE'],
      scrolltext: (raw['scrolltext'] as string) ?? 'GREETINGS PROGRAM',
      cycleCount: (raw['cycleCount'] as number) ?? 5,
      palette: (raw['palette'] as TronConfig['palette']) ?? 'classic',
    };

    const c = PALETTES[cfg.palette ?? 'classic'] ?? PALETTES['classic']!;
    const horizonY = Math.round(h * 0.45);
    const totalTaglineDur = cfg.taglines.length * 3;

    const cycles = generateCycles(w, h, horizonY, cfg.cycleCount ?? 5, c);

    const taglines = cfg.taglines.map((tagline, i) => {
      const start = i / cfg.taglines.length;
      const end = (i + 0.85) / cfg.taglines.length;
      return `
      <text x="${w / 2}" y="${horizonY - 25}" text-anchor="middle"
            font-family="'JetBrains Mono', monospace" font-size="16"
            fill="${c.trail}" letter-spacing="4" opacity="0">
        ${escapeXml(tagline.toUpperCase())}
        <animate attributeName="opacity" values="0;0;1;1;0;0"
                 keyTimes="0;${start.toFixed(3)};${(start + 0.02).toFixed(3)};${(end - 0.02).toFixed(3)};${end.toFixed(3)};1"
                 dur="${totalTaglineDur}s" repeatCount="indefinite"/>
      </text>`;
    }).join('');

    const scrollLen = (cfg.scrolltext ?? '').length * 10;
    const scrollDur = Math.max(12, scrollLen / 50);

    const svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"
  role="img" aria-label="${escapeXml(cfg.name)} — tron card">
  <style>
    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
    }
  </style>
  <defs>
    <linearGradient id="tronSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c.bg}"/>
      <stop offset="60%" stop-color="${c.horizon}"/>
      <stop offset="100%" stop-color="${c.bg}"/>
    </linearGradient>
    <filter id="cycleGlow">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="textGlow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <radialGradient id="hGlow" cx="50%" cy="0%" r="80%">
      <stop offset="0%" stop-color="${c.trail}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${c.trail}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${w}" height="${h}" rx="12" fill="url(#tronSky)"/>

  <!-- Horizon glow -->
  <rect x="0" y="${horizonY - 40}" width="${w}" height="80" fill="url(#hGlow)"/>
  <line x1="0" y1="${horizonY}" x2="${w}" y2="${horizonY}" stroke="${c.trail}" stroke-width="1" opacity="0.4"/>

  <!-- Grid plane -->
  <g>
    ${generateGrid(w, h, horizonY, c)}
  </g>

  <!-- Light cycles -->
  <g>
    ${cycles.map((cycle, i) => renderCycle(cycle, i)).join('')}
  </g>

  <!-- Title -->
  <text x="${w / 2}" y="${horizonY - 60}" text-anchor="middle"
        font-family="'JetBrains Mono', 'Courier New', monospace" font-size="44" font-weight="700"
        fill="${c.text}" filter="url(#textGlow)" letter-spacing="8">
    ${escapeXml(cfg.name)}
  </text>

  <!-- Taglines -->
  ${taglines}

  <!-- Scrolltext -->
  <text y="${h - 10}" font-family="'JetBrains Mono', monospace" font-size="10"
        fill="${c.trail}" letter-spacing="3" opacity="0.5">
    ${escapeXml(cfg.scrolltext ?? '')}
    <animate attributeName="x" from="${w + 20}" to="${-scrollLen}" dur="${scrollDur}s" repeatCount="indefinite"/>
  </text>

  <!-- Frame -->
  <rect width="${w}" height="${h}" rx="12" fill="none" stroke="${c.trail}" stroke-width="1" opacity="0.15"/>
</svg>`;

    return { svg, filename: 'tron.svg', width: w, height: h };
  },
};
