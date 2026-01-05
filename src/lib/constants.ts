/**
 * Centralized constants and defaults for the Firecrawl CLI.
 * Extracted to avoid magic numbers scattered across commands.
 */

/** Polling and timeout defaults for async operations */
export const POLL_INTERVAL = 2; // seconds

export const TIMEOUTS = {
  CRAWL: 600, // 10 minutes
  AGENT: 300, // 5 minutes
} as const;

/** Default limits for various operations */
export const DEFAULTS = {
  CRAWL_LIMIT: 50,
  CRAWL_DEPTH: 3,
} as const;

/** Valid format options for scrape operations */
export const VALID_FORMATS = [
  'markdown',
  'html',
  'links',
  'screenshot',
] as const;

export type ScrapeFormat = (typeof VALID_FORMATS)[number];

/** Valid sitemap handling options */
export const VALID_SITEMAP_OPTIONS = ['only', 'include', 'skip'] as const;

export type SitemapOption = (typeof VALID_SITEMAP_OPTIONS)[number];
