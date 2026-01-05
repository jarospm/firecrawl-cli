import { command, positional, flag, option, optional, string } from 'cmd-ts';
import { getClient } from '../lib/firecrawl.js';
import { outputSearch } from '../lib/output.js';
import {
  setQuiet,
  setVerbose,
  status,
  success,
  warn,
  error,
} from '../lib/progress.js';
import { parsePositiveInt } from '../lib/parse.js';
import { extractSearchResult } from '../lib/type-guards.js';
import type { SearchResult } from '../types/index.js';

export const search = command({
  name: 'search',
  description: 'Search the web and return results',
  args: {
    query: positional({
      type: string,
      displayName: 'query',
      description: 'The search query',
    }),
    limit: option({
      type: optional(string),
      long: 'limit',
      description: 'Number of results (default: Firecrawl default)',
    }),
    scrape: flag({
      long: 'scrape',
      description: 'Also scrape content from each result',
    }),
    lang: option({
      type: optional(string),
      long: 'lang',
      description: 'Language code (e.g., en, es, de)',
    }),
    country: option({
      type: optional(string),
      long: 'country',
      description: 'Country code (e.g., us, uk, de)',
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
  handler: async ({
    query,
    limit,
    scrape: scrapeContent,
    lang,
    country,
    json,
    quiet,
    verbose,
  }) => {
    setQuiet(quiet);
    setVerbose(verbose);

    status(`Searching for "${query}"...`);

    try {
      const client = getClient();

      // Parse limit with validation
      const parsedLimit = limit ? parsePositiveInt(limit, 'limit') : undefined;

      // Build location string from lang/country if provided
      const location =
        lang && country ? `${lang}-${country}` : lang || country || undefined;

      const response = await client.search(query, {
        limit: parsedLimit,
        location,
        scrapeOptions: scrapeContent ? { formats: ['markdown'] } : undefined,
      });

      // Extract results using type guards (handles SDK union types safely)
      const webResults = response.web || [];
      const results: SearchResult[] = webResults
        .map((item) => {
          const extracted = extractSearchResult(item);
          if (!extracted || !extracted.url) return null;

          return {
            title: extracted.title,
            url: extracted.url,
            snippet: extracted.description,
            content: scrapeContent ? extracted.markdown : undefined,
          } as SearchResult;
        })
        .filter((item): item is SearchResult => item !== null);

      // Warn about any failures if scraping
      if (scrapeContent) {
        const failed = results.filter((r) => !r.content);
        if (failed.length > 0) {
          warn(`Failed to scrape ${failed.length} result(s)`);
        }
      }

      success(
        `Found ${results.length} result${results.length !== 1 ? 's' : ''}`
      );

      outputSearch({ query, results }, json);
    } catch (err) {
      error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  },
});
