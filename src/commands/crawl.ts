import { command, positional, flag, option, optional, string } from 'cmd-ts';
import { getClient } from '../lib/firecrawl.js';
import { outputCrawl } from '../lib/output.js';
import {
  setQuiet,
  setVerbose,
  status,
  success,
  warn,
  error,
} from '../lib/progress.js';
import { parseOptionalInt } from '../lib/parse.js';
import { POLL_INTERVAL, TIMEOUTS, DEFAULTS } from '../lib/constants.js';
import type { CrawlPage } from '../types/index.js';

export const crawl = command({
  name: 'crawl',
  description:
    'Recursively crawl a website and return content from multiple pages',
  args: {
    url: positional({
      type: string,
      displayName: 'url',
      description: 'The starting URL to crawl',
    }),
    limit: option({
      type: optional(string),
      long: 'limit',
      description: `Maximum pages to crawl (default: ${DEFAULTS.CRAWL_LIMIT})`,
    }),
    depth: option({
      type: optional(string),
      long: 'depth',
      description: `Maximum link depth (default: ${DEFAULTS.CRAWL_DEPTH})`,
    }),
    json: flag({
      long: 'json',
      description: 'Output as JSON instead of markdown',
    }),
    quiet: flag({
      long: 'quiet',
      description: 'Suppress progress and status messages',
    }),
    verbose: flag({
      long: 'verbose',
      description: 'Show detailed progress information',
    }),
  },
  handler: async ({ url, limit, depth, json, quiet, verbose }) => {
    setQuiet(quiet);
    setVerbose(verbose);

    const maxPages = parseOptionalInt(limit, DEFAULTS.CRAWL_LIMIT, 'limit');
    const maxDepth = parseOptionalInt(depth, DEFAULTS.CRAWL_DEPTH, 'depth');

    status(`Crawling ${url}...`);

    try {
      const client = getClient();

      // Use SDK's built-in crawl() with automatic polling
      const result = await client.crawl(url, {
        limit: maxPages,
        maxDiscoveryDepth: maxDepth,
        scrapeOptions: {
          formats: ['markdown'],
        },
        pollInterval: POLL_INTERVAL,
        timeout: TIMEOUTS.CRAWL,
      });

      if (result.status === 'failed' || result.status === 'cancelled') {
        error(`Crawl job ${result.status}`);
        process.exit(1);
      }

      // Map results to our page format
      const pages: CrawlPage[] = (result.data || []).map((item) => ({
        url: item.metadata?.url || 'unknown',
        title: item.metadata?.title,
        content: item.markdown || '',
      }));

      // Check for pages without content
      const emptyPages = pages.filter((p) => !p.content);
      if (emptyPages.length > 0) {
        warn(`${emptyPages.length} page(s) returned empty content`);
      }

      const validPages = pages.filter((p) => p.content);

      success(
        `Crawled ${validPages.length} page${validPages.length !== 1 ? 's' : ''}${
          emptyPages.length > 0 ? ` (${emptyPages.length} empty)` : ''
        }`
      );

      outputCrawl(
        {
          baseUrl: url,
          pages: validPages,
          count: validPages.length,
        },
        json
      );
    } catch (err) {
      error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  },
});
