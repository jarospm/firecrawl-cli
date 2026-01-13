import { command, positional, flag, option, optional, string } from 'cmd-ts';
import { getClient } from '../lib/firecrawl.js';
import { outputScrape } from '../lib/output.js';
import {
  setQuiet,
  setVerbose,
  status,
  success,
  detail,
  error,
} from '../lib/progress.js';
import { parseFormats } from '../lib/parse.js';
import { VALID_FORMATS } from '../lib/constants.js';

export const scrape = command({
  name: 'scrape',
  description: 'Scrape a single URL and return its content',
  args: {
    url: positional({
      type: string,
      displayName: 'url',
      description: 'The URL to scrape',
    }),
    formats: option({
      type: optional(string),
      long: 'formats',
      description: `Content formats: ${VALID_FORMATS.join(', ')} (default: markdown)`,
    }),
    onlyMain: flag({
      long: 'only-main',
      description:
        'Extract only main content, excluding navigation/headers/footers',
    }),
    wait: option({
      type: optional(string),
      long: 'wait',
      description: 'Additional wait time in ms for JavaScript rendering',
    }),
    fresh: flag({
      long: 'fresh',
      description: 'Force fresh scrape, bypassing Firecrawl cache',
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
  handler: async ({ url, formats, onlyMain, wait, fresh, json, quiet, verbose }) => {
    setQuiet(quiet);
    setVerbose(verbose);

    status(`Scraping ${url}...`);

    try {
      const client = getClient();

      // Parse and validate formats
      const formatList = formats ? parseFormats(formats) : ['markdown'];

      // Parse wait time if provided
      let waitFor: number | undefined;
      if (wait) {
        const parsed = parseInt(wait, 10);
        if (isNaN(parsed) || parsed < 0) {
          throw new Error(`wait must be a non-negative integer, got: ${wait}`);
        }
        waitFor = parsed;
      }

      if (fresh) {
        detail('Forcing fresh scrape (bypassing cache)');
      }

      const response = await client.scrape(url, {
        formats: formatList as ('markdown' | 'html' | 'links' | 'screenshot')[],
        onlyMainContent: onlyMain || undefined,
        waitFor,
        ...(fresh && { maxAge: 0 }), // Only set maxAge when forcing fresh
      });

      success('Scraped 1 page');

      outputScrape(
        {
          url,
          title: response.metadata?.title,
          content: response.markdown || '',
          metadata: response.metadata,
        },
        json
      );
    } catch (err) {
      error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  },
});
