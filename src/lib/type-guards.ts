/**
 * Type guards for safely narrowing Firecrawl SDK union types.
 * Replaces unsafe type assertions with proper runtime checks.
 */

/**
 * Shape of a web search result from the SDK.
 * Direct result without scraping.
 */
export interface SearchResultWeb {
  url?: string;
  title?: string;
  description?: string;
}

/**
 * Shape of a document result from the SDK.
 * Result with scraped content.
 */
export interface DocumentResult {
  metadata?: {
    url?: string;
    title?: string;
    description?: string;
  };
  markdown?: string;
}

/**
 * Checks if an item is a SearchResultWeb (direct search result).
 * @param item - Unknown item from SDK response
 * @returns True if item has direct url/title/description properties
 */
export function isSearchResultWeb(item: unknown): item is SearchResultWeb {
  if (!item || typeof item !== 'object') return false;
  const obj = item as Record<string, unknown>;
  // SearchResultWeb has direct url property (not nested in metadata)
  return 'url' in obj && typeof obj['url'] === 'string';
}

/**
 * Checks if an item is a DocumentResult (scraped document).
 * @param item - Unknown item from SDK response
 * @returns True if item has metadata object with url
 */
export function isDocumentResult(item: unknown): item is DocumentResult {
  if (!item || typeof item !== 'object') return false;
  const obj = item as Record<string, unknown>;
  // DocumentResult has metadata object containing url
  if (!('metadata' in obj) || typeof obj['metadata'] !== 'object') return false;
  const metadata = obj['metadata'] as Record<string, unknown> | null;
  return metadata !== null && 'url' in metadata;
}

/**
 * Extracts normalized search result data from either result type.
 * @param item - Search result item (SearchResultWeb or DocumentResult)
 * @returns Normalized object with url, title, description, and optional markdown
 */
export function extractSearchResult(item: unknown): {
  url: string;
  title: string;
  description: string;
  markdown?: string;
} | null {
  if (isSearchResultWeb(item)) {
    return {
      url: item.url || '',
      title: item.title || 'Untitled',
      description: item.description || '',
    };
  }

  if (isDocumentResult(item)) {
    return {
      url: item.metadata?.url || '',
      title: item.metadata?.title || 'Untitled',
      description: item.metadata?.description || '',
      markdown: item.markdown,
    };
  }

  return null;
}
