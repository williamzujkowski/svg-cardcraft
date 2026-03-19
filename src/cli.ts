#!/usr/bin/env node
/**
 * svg-cardcraft CLI — generate animated SVG cards from YAML config.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cards } from './cards/index.js';
import type { SiteConfig } from './core/types.js';

// Minimal YAML parser (key: value only — for full YAML, add js-yaml dep)
function parseYamlLite(content: string): SiteConfig {
  // For now, use JSON config (add js-yaml later)
  return JSON.parse(content) as SiteConfig;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const configPath = args.find(a => !a.startsWith('-')) ?? 'cardcraft.json';

  console.log('svg-cardcraft — generating cards...\n');

  let config: SiteConfig;
  try {
    const raw = readFileSync(configPath, 'utf-8');
    config = configPath.endsWith('.json') ? JSON.parse(raw) : parseYamlLite(raw);
  } catch (e) {
    console.error(`Failed to read config: ${configPath}`);
    process.exit(1);
  }

  const outputDir = config.outputDir ?? 'output';
  mkdirSync(outputDir, { recursive: true });

  const timeout = config.fetchTimeout ?? 10000;

  for (const cardConfig of config.cards) {
    const renderer = cards[cardConfig.type];
    if (!renderer) {
      console.warn(`  Unknown card type: ${cardConfig.type} — skipping`);
      continue;
    }

    try {
      const result = await renderer.render(cardConfig, timeout);
      const outPath = join(outputDir, result.filename);
      writeFileSync(outPath, result.svg, 'utf-8');
      const sizeKB = (Buffer.byteLength(result.svg) / 1024).toFixed(1);
      console.log(`  ✓ ${result.filename} (${result.width}x${result.height}, ${sizeKB} KB)`);
    } catch (err) {
      console.error(`  ✗ ${cardConfig.type}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(`\nDone — cards written to ${outputDir}/`);
}

main().catch(console.error);
