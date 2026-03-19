import type { CardRenderer } from '../core/types.js';
import { heroCard } from './hero.js';
import { statsCard } from './stats.js';
import { quoteCard } from './quote.js';
import { demosceneCard } from './demoscene.js';
import { tronCard } from './tron.js';

export const cards: Record<string, CardRenderer> = {
  hero: heroCard,
  stats: statsCard,
  quote: quoteCard,
  demoscene: demosceneCard,
  tron: tronCard,
};
