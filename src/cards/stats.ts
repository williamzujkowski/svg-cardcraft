/**
 * Stats Dashboard Card — animated GitHub statistics.
 * Pulls live data from GitHub API.
 */

import type { CardConfig, CardResult, CardRenderer } from '../core/types.js';
import { escapeXml } from '../core/xml.js';
import { fetchJson } from '../core/fetch.js';

interface GitHubUser {
  public_repos: number;
  followers: number;
  following: number;
  public_gists: number;
  created_at: string;
}

interface StatsConfig {
  username: string;
  title?: string;
  showLanguages?: boolean;
  accentColor?: string;
}

function animatedCounter(x: number, y: number, value: number, label: string, color: string, delay: number): string {
  // SMIL animation counting from 0 to value
  return `
    <g transform="translate(${x}, ${y})">
      <text text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="32" font-weight="700" fill="${color}">
        ${value}
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="${delay}s" fill="freeze"/>
      </text>
      <text y="25" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="11" fill="#8b949e" letter-spacing="1">
        ${escapeXml(label.toUpperCase())}
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="${delay + 0.2}s" fill="freeze"/>
      </text>
    </g>`;
}

function miniBarChart(x: number, y: number, w: number, h: number, values: Array<{ label: string; pct: number; color: string }>): string {
  const barWidth = Math.floor(w / values.length) - 4;
  return values.map((v, i) => {
    const bx = x + i * (barWidth + 4);
    const barH = Math.round(v.pct * h);
    return `
      <rect x="${bx}" y="${y + h - barH}" width="${barWidth}" height="${barH}" rx="2" fill="${v.color}" opacity="0.8">
        <animate attributeName="height" from="0" to="${barH}" dur="0.6s" begin="${0.5 + i * 0.1}s" fill="freeze"/>
        <animate attributeName="y" from="${y + h}" to="${y + h - barH}" dur="0.6s" begin="${0.5 + i * 0.1}s" fill="freeze"/>
      </rect>
      <text x="${bx + barWidth / 2}" y="${y + h + 14}" text-anchor="middle" font-size="8" fill="#8b949e">
        ${escapeXml(v.label)}
      </text>`;
  }).join('');
}

export const statsCard: CardRenderer = {
  name: 'stats',

  async render(cardConfig: CardConfig, fetchTimeout: number): Promise<CardResult> {
    const w = cardConfig.width ?? 480;
    const h = cardConfig.height ?? 200;
    const cfg: StatsConfig = {
      username: (cardConfig.config['username'] as string) ?? 'octocat',
      title: cardConfig.config['title'] as string | undefined,
      accentColor: (cardConfig.config['accentColor'] as string) ?? '#6366f1',
    };

    // Fetch GitHub data
    const user = await fetchJson<GitHubUser>(`https://api.github.com/users/${encodeURIComponent(cfg.username)}`, fetchTimeout);

    const repos = user?.public_repos ?? 0;
    const followers = user?.followers ?? 0;
    const following = user?.following ?? 0;
    const gists = user?.public_gists ?? 0;
    const memberSince = user?.created_at ? new Date(user.created_at).getFullYear() : '?';

    const accent = cfg.accentColor!;
    const title = cfg.title ?? `${cfg.username}'s GitHub`;

    const svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"
  role="img" aria-label="${escapeXml(title)}">
  <style>
    @media (prefers-color-scheme: light) {
      .card-bg { fill: #ffffff; stroke: #d0d7de; }
      .card-title { fill: #1f2328; }
      .card-subtitle { fill: #656d76; }
    }
    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.01ms !important; }
    }
  </style>

  <!-- Card background -->
  <rect class="card-bg" width="${w}" height="${h}" rx="12" fill="#0d1117" stroke="#30363d" stroke-width="1"/>

  <!-- Accent line -->
  <rect x="0" y="0" width="${w}" height="3" rx="12" fill="${accent}">
    <animate attributeName="width" from="0" to="${w}" dur="0.8s" fill="freeze"/>
  </rect>

  <!-- Title -->
  <text class="card-title" x="24" y="36" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="600" fill="#e6edf3">
    ${escapeXml(title)}
  </text>
  <text class="card-subtitle" x="24" y="54" font-family="'Segoe UI', sans-serif" font-size="11" fill="#8b949e">
    Member since ${memberSince}
  </text>

  <!-- Stats grid -->
  ${animatedCounter(90, 100, repos, 'Repos', accent, 0.3)}
  ${animatedCounter(210, 100, followers, 'Followers', '#3fb950', 0.5)}
  ${animatedCounter(330, 100, following, 'Following', '#8b949e', 0.7)}
  ${animatedCounter(440, 100, gists, 'Gists', '#d29922', 0.9)}

  <!-- Bottom bar -->
  <line x1="24" y1="${h - 24}" x2="${w - 24}" y2="${h - 24}" stroke="#21262d" stroke-width="1"/>
  <text x="${w - 24}" y="${h - 8}" text-anchor="end" font-size="9" fill="#484f58">
    svg-cardcraft
  </text>
</svg>`;

    return { svg, filename: 'stats.svg', width: w, height: h };
  },
};
