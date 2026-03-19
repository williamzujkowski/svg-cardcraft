/** Configuration for a single card. */
export interface CardConfig {
  type: string;
  width?: number;
  height?: number;
  theme?: 'dark' | 'light' | 'auto';
  config: Record<string, unknown>;
}

/** Full configuration file. */
export interface SiteConfig {
  cards: CardConfig[];
  fetchTimeout?: number;
  outputDir?: string;
}

/** Result of rendering a card. */
export interface CardResult {
  svg: string;
  filename: string;
  width: number;
  height: number;
}

/** A card renderer. */
export interface CardRenderer {
  name: string;
  render(config: CardConfig, fetchTimeout: number): Promise<CardResult>;
}
