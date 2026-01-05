import { command, positional, flag, option, optional, string } from 'cmd-ts';
import { getClient } from '../lib/firecrawl.js';
import { outputMap } from '../lib/output.js';
import {
  setQuiet,
  setVerbose,
  status,
  success,
  error,
} from '../lib/progress.js';
import { parsePositiveInt, parseSitemap } from '../lib/parse.js';
import { VALID_SITEMAP_OPTIONS } from '../lib/constants.js';

export const map = command({
  name: 'map',
  description: 'Discover all URLs on a website',
  args: {
    url: positional({
      type: string,
      displayName: 'url',
      description: 'The starting URL to map',
    }),
    limit: option({
      type: optional(string),
      long: 'limit',
      description: 'Maximum URLs to discover',
    }),
    search: option({
      type: optional(string),
      long: 'search',
      description: 'Filter URLs by keyword',
    }),
    includeSubdomains: flag({
      long: 'include-subdomains',
      description: 'Include URLs from subdomains',
    }),
    sitemap: option({
      type: optional(string),
      long: 'sitemap',
      description: `Sitemap handling: ${VALID_SITEMAP_OPTIONS.join(', ')}`,
    }),
    json: flag({
      long: 'json',
      description: 'Output as JSON instead of plain text',
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
  handler: async ({
    url,
    limit,
    search,
    includeSubdomains,
    sitemap,
    json,
    quiet,
    verbose,
  }) => {
    setQuiet(quiet);
    setVerbose(verbose);

    status(`Mapping ${url}...`);

    try {
      const client = getClient();

      // Parse and validate options
      const parsedLimit = limit ? parsePositiveInt(limit, 'limit') : undefined;
      const parsedSitemap = sitemap ? parseSitemap(sitemap) : undefined;

      const response = await client.map(url, {
        limit: parsedLimit,
        search: search || undefined,
        includeSubdomains: includeSubdomains || undefined,
        sitemap: parsedSitemap,
      });

      const urls = (response.links || []).map((link) => link.url);

      success(`Mapped ${urls.length} URL${urls.length !== 1 ? 's' : ''}`);

      outputMap(
        {
          baseUrl: url,
          urls,
          count: urls.length,
        },
        json
      );
    } catch (err) {
      error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  },
});
