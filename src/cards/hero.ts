/**
 * Hero Card — animated full-width profile banner.
 *
 * Features:
 * - Animated gradient background
 * - Floating particle effect
 * - Typing/deleting text animation (CSS only)
 * - Social link icons
 * - prefers-color-scheme + prefers-reduced-motion support
 */

import type { CardConfig, CardResult, CardRenderer } from '../core/types.js';
import { escapeXml } from '../core/xml.js';

interface HeroConfig {
  name: string;
  taglines: string[];
  subtitle?: string;
  gradientColors?: string[];
  particleCount?: number;
  links?: Array<{ label: string; url: string }>;
}

function parseConfig(raw: Record<string, unknown>): HeroConfig {
  return {
    name: (raw['name'] as string) ?? 'Hello World',
    taglines: (raw['taglines'] as string[]) ?? ['Developer', 'Builder', 'Creator'],
    subtitle: raw['subtitle'] as string | undefined,
    gradientColors: (raw['gradientColors'] as string[]) ?? ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'],
    particleCount: (raw['particleCount'] as number) ?? 40,
    links: raw['links'] as Array<{ label: string; url: string }> | undefined,
  };
}

function generateParticles(count: number, w: number, h: number): string {
  const particles: string[] = [];
  for (let i = 0; i < count; i++) {
    const cx = Math.round(Math.random() * w);
    const cy = Math.round(Math.random() * h);
    const r = 1 + Math.random() * 2;
    const dur = 3 + Math.random() * 5;
    const delay = Math.random() * dur;
    const dy = -20 - Math.random() * 40;
    particles.push(`
      <circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="rgba(255,255,255,0.3)" class="particle">
        <animate attributeName="cy" from="${cy}" to="${cy + dy}" dur="${dur.toFixed(1)}s" begin="${delay.toFixed(1)}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.6;0" dur="${dur.toFixed(1)}s" begin="${delay.toFixed(1)}s" repeatCount="indefinite"/>
      </circle>`);
  }
  return particles.join('');
}

function generateTypingCSS(taglines: string[]): string {
  // CSS typing animation that cycles through taglines
  const totalDuration = taglines.length * 4; // 4s per tagline
  const keyframes: string[] = [];
  const opacityFrames: string[] = [];

  for (let i = 0; i < taglines.length; i++) {
    const start = (i / taglines.length) * 100;
    const typeEnd = start + (1 / taglines.length) * 40;
    const holdEnd = start + (1 / taglines.length) * 70;
    const fadeEnd = start + (1 / taglines.length) * 95;

    // width animation (typing effect)
    keyframes.push(`${start.toFixed(1)}% { width: 0; }`);
    keyframes.push(`${typeEnd.toFixed(1)}% { width: ${taglines[i]!.length}ch; }`);
    keyframes.push(`${holdEnd.toFixed(1)}% { width: ${taglines[i]!.length}ch; }`);
    keyframes.push(`${fadeEnd.toFixed(1)}% { width: 0; }`);

    // content switching (via opacity on stacked texts)
    opacityFrames.push(`${start.toFixed(1)}% { opacity: 1; }`);
    opacityFrames.push(`${fadeEnd.toFixed(1)}% { opacity: 1; }`);
    if (i < taglines.length - 1) {
      opacityFrames.push(`${(fadeEnd + 0.1).toFixed(1)}% { opacity: 0; }`);
    }
  }

  return `
    @keyframes typing {
      ${keyframes.join('\n      ')}
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    @keyframes gradientShift {
      0% { stop-color: var(--g1); }
      25% { stop-color: var(--g2); }
      50% { stop-color: var(--g3); }
      75% { stop-color: var(--g4); }
      100% { stop-color: var(--g1); }
    }
    @keyframes gradientShift2 {
      0% { stop-color: var(--g3); }
      25% { stop-color: var(--g4); }
      50% { stop-color: var(--g1); }
      75% { stop-color: var(--g2); }
      100% { stop-color: var(--g3); }
    }
    .typing-text {
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      border-right: 3px solid rgba(255,255,255,0.8);
      animation: typing ${totalDuration}s steps(30) infinite, blink 0.8s step-end infinite;
    }
    .particle { pointer-events: none; }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
      }
      .particle { display: none; }
      .typing-text { border-right: none; width: auto !important; overflow: visible; }
    }`;
}

export const heroCard: CardRenderer = {
  name: 'hero',

  async render(cardConfig: CardConfig, _fetchTimeout: number): Promise<CardResult> {
    const w = cardConfig.width ?? 900;
    const h = cardConfig.height ?? 300;
    const cfg = parseConfig(cardConfig.config);
    const colors = cfg.gradientColors!;

    // Build tagline display — we cycle through taglines using SMIL
    const taglineElements = cfg.taglines.map((tagline, i) => {
      const totalDur = cfg.taglines.length * 4;
      const startPct = i / cfg.taglines.length;
      const endPct = (i + 0.9) / cfg.taglines.length;
      return `
        <text x="${w / 2}" y="${h / 2 + 20}" text-anchor="middle"
              font-family="'Segoe UI', system-ui, -apple-system, sans-serif"
              font-size="22" fill="rgba(255,255,255,0.9)" letter-spacing="2">
          ${escapeXml(tagline)}
          <animate attributeName="opacity" values="0;0;1;1;0;0"
                   keyTimes="0;${startPct.toFixed(3)};${(startPct + 0.03).toFixed(3)};${(endPct - 0.03).toFixed(3)};${endPct.toFixed(3)};1"
                   dur="${totalDur}s" repeatCount="indefinite"/>
        </text>`;
    }).join('');

    // Links row
    const linksRow = cfg.links
      ? cfg.links.map((link, i) => {
          const lx = w / 2 - (cfg.links!.length * 60) / 2 + i * 60;
          return `<text x="${lx + 30}" y="${h - 30}" text-anchor="middle"
                        font-family="'Segoe UI', system-ui, sans-serif" font-size="11"
                        fill="rgba(255,255,255,0.6)" letter-spacing="1">
                    ${escapeXml(link.label.toUpperCase())}
                  </text>`;
        }).join('')
      : '';

    const svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"
  role="img" aria-label="${escapeXml(cfg.name)} profile card">
  <style>
    :root {
      --g1: ${colors[0] ?? '#6366f1'};
      --g2: ${colors[1] ?? '#8b5cf6'};
      --g3: ${colors[2] ?? '#ec4899'};
      --g4: ${colors[3] ?? '#f43f5e'};
    }
    ${generateTypingCSS(cfg.taglines)}
  </style>
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:var(--g1)">
        <animate attributeName="stop-color" values="${colors.join(';')};${colors[0]}" dur="8s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" style="stop-color:var(--g3)">
        <animate attributeName="stop-color" values="${[...colors].reverse().join(';')};${colors[colors.length - 1]}" dur="8s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${w}" height="${h}" rx="16" fill="url(#bgGrad)"/>

  <!-- Subtle mesh overlay -->
  <rect width="${w}" height="${h}" rx="16" fill="url(#bgGrad)" opacity="0.3" style="mix-blend-mode: overlay"/>

  <!-- Particles -->
  <g>
    ${generateParticles(cfg.particleCount ?? 40, w, h)}
  </g>

  <!-- Name -->
  <text x="${w / 2}" y="${h / 2 - 30}" text-anchor="middle"
        font-family="'Segoe UI', system-ui, -apple-system, sans-serif"
        font-size="42" font-weight="700" fill="white" letter-spacing="-1">
    ${escapeXml(cfg.name)}
  </text>

  <!-- Rotating taglines -->
  ${taglineElements}

  <!-- Subtitle -->
  ${cfg.subtitle ? `
  <text x="${w / 2}" y="${h / 2 + 55}" text-anchor="middle"
        font-family="'Segoe UI', system-ui, sans-serif"
        font-size="14" fill="rgba(255,255,255,0.5)" letter-spacing="1">
    ${escapeXml(cfg.subtitle)}
  </text>` : ''}

  <!-- Links -->
  ${linksRow}

  <!-- Bottom fade -->
  <defs>
    <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.2)"/>
    </linearGradient>
  </defs>
  <rect y="${h - 60}" width="${w}" height="60" rx="0" fill="url(#bottomFade)"/>
</svg>`;

    return {
      svg,
      filename: 'hero.svg',
      width: w,
      height: h,
    };
  },
};
