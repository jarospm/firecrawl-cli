export interface ScrapeResult {
  url: string;
  title?: string;
  content: string;
  metadata?: {
    description?: string;
    language?: string;
    [key: string]: unknown;
  };
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}

export interface MapResponse {
  baseUrl: string;
  urls: string[];
  count: number;
}

export interface CrawlPage {
  url: string;
  title?: string;
  content: string;
}

export interface CrawlResponse {
  baseUrl: string;
  pages: CrawlPage[];
  count: number;
}

/** Result from agent command - prompt and extracted data */
export interface AgentResult {
  prompt: string;
  data: unknown;
}
