/**
 * Output formatting utilities.
 * All content goes to stdout to enable piping.
 */

import type {
  ScrapeResult,
  SearchResponse,
  MapResponse,
  CrawlResponse,
} from '../types/index.js';

/**
 * Outputs scrape result to stdout.
 * @param result - Scrape result with content and metadata
 * @param json - If true, output as JSON; otherwise output markdown content
 */
export function outputScrape(result: ScrapeResult, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(result.content);
  }
}

/**
 * Outputs search results to stdout.
 * @param response - Search response with query and results
 * @param json - If true, output as JSON; otherwise output formatted markdown
 */
export function outputSearch(response: SearchResponse, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(response, null, 2));
  } else {
    console.log(`## Search Results for "${response.query}"\n`);
    response.results.forEach((result, index) => {
      if (result.content) {
        // With --scrape: full content
        console.log('---\n');
        console.log(`### Result ${index + 1}: ${result.title}`);
        console.log(`**URL:** ${result.url}\n`);
        console.log(result.content);
        console.log('');
      } else {
        // Without --scrape: compact list
        console.log(`${index + 1}. **${result.title}**`);
        console.log(`   ${result.url}`);
        console.log(`   ${result.snippet}\n`);
      }
    });
  }
}

/**
 * Outputs map results to stdout.
 * @param response - Map response with discovered URLs
 * @param json - If true, output as JSON; otherwise output plain URL list
 */
export function outputMap(response: MapResponse, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(response, null, 2));
  } else {
    response.urls.forEach((url) => console.log(url));
  }
}

/**
 * Outputs crawl results to stdout.
 * @param response - Crawl response with pages
 * @param json - If true, output as JSON; otherwise output formatted markdown
 */
export function outputCrawl(response: CrawlResponse, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(response, null, 2));
  } else {
    console.log(`# Crawl Results: ${response.baseUrl}\n`);
    response.pages.forEach((page, index) => {
      console.log('---\n');
      console.log(`## Page ${index + 1}: ${page.title || 'Untitled'}`);
      console.log(`**URL:** ${page.url}\n`);
      console.log(page.content);
      console.log('');
    });
  }
}

/**
 * Outputs agent result to stdout.
 * Agent results are typically structured data, so default to JSON.
 * @param data - Agent result data (can be any type from SDK)
 * @param json - If true, always output as JSON; otherwise auto-detect
 */
export function outputAgent(data: unknown, json: boolean): void {
  // Agent responses are typically objects - format as JSON for readability
  const isObject = data !== null && typeof data === 'object';

  if (json || isObject) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log('# Agent Results\n');
    console.log(String(data));
  }
}
