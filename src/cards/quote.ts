/**
 * Quote Card — elegant rotating quotes with attribution.
 */

import type { CardConfig, CardResult, CardRenderer } from '../core/types.js';
import { escapeXml } from '../core/xml.js';

interface QuoteConfig {
  quotes: Array<{ text: string; author: string }>;
  accentColor?: string;
  fontStyle?: 'serif' | 'sans';
}

export const quoteCard: CardRenderer = {
  name: 'quote',

  async render(cardConfig: CardConfig): Promise<CardResult> {
    const w = cardConfig.width ?? 600;
    const h = cardConfig.height ?? 160;
    const cfg: QuoteConfig = {
      quotes: (cardConfig.config['quotes'] as Array<{ text: string; author: string }>) ?? [
        { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
      ],
      accentColor: (cardConfig.config['accentColor'] as string) ?? '#8b5cf6',
      fontStyle: (cardConfig.config['fontStyle'] as 'serif' | 'sans') ?? 'serif',
    };

    const fontFamily = cfg.fontStyle === 'serif'
      ? "'Georgia', 'Times New Roman', serif"
      : "'Segoe UI', system-ui, sans-serif";

    // Pick a deterministic quote based on day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const quote = cfg.quotes[dayOfYear % cfg.quotes.length]!;

    const svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"
  role="img" aria-label="Quote: ${escapeXml(quote.text)}">
  <style>
    @media (prefers-color-scheme: light) {
      .q-bg { fill: #fafafa; stroke: #e5e7eb; }
      .q-text { fill: #1f2937; }
      .q-author { fill: #6b7280; }
      .q-mark { fill: #d1d5db; }
    }
    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.01ms !important; }
    }
  </style>

  <rect class="q-bg" width="${w}" height="${h}" rx="12" fill="#161b22" stroke="#30363d"/>

  <!-- Large quotation mark -->
  <text class="q-mark" x="24" y="55" font-family="Georgia, serif" font-size="60" fill="#21262d" opacity="0.6">
    \u201C
  </text>

  <!-- Quote text -->
  <text class="q-text" x="${w / 2}" y="${h / 2 - 5}" text-anchor="middle"
        font-family="${fontFamily}" font-size="18" font-style="italic" fill="#e6edf3">
    ${escapeXml(quote.text)}
    <animate attributeName="opacity" from="0" to="1" dur="1s" fill="freeze"/>
  </text>

  <!-- Author -->
  <text class="q-author" x="${w / 2}" y="${h / 2 + 30}" text-anchor="middle"
        font-family="'Segoe UI', sans-serif" font-size="13" fill="${cfg.accentColor}">
    — ${escapeXml(quote.author)}
    <animate attributeName="opacity" from="0" to="1" dur="1s" begin="0.5s" fill="freeze"/>
  </text>

  <!-- Accent line -->
  <rect x="${w / 2 - 30}" y="${h - 20}" width="60" height="2" rx="1" fill="${cfg.accentColor}" opacity="0.5">
    <animate attributeName="width" from="0" to="60" dur="0.8s" begin="0.3s" fill="freeze"/>
    <animate attributeName="x" from="${w / 2}" to="${w / 2 - 30}" dur="0.8s" begin="0.3s" fill="freeze"/>
  </rect>
</svg>`;

    return { svg, filename: 'quote.svg', width: w, height: h };
  },
};
