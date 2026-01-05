# Firecrawl API Documentation

Firecrawl is a web data infrastructure platform that converts websites into clean, structured data optimized for AI applications. It handles the complexity of modern web scraping including JavaScript rendering, proxy rotation, anti-bot mechanisms, and output parsing.

## Overview

Firecrawl provides a REST API with SDKs available for multiple languages. This documentation focuses on the **Node.js SDK** and **direct API** usage. All requests require authentication via Bearer token in the Authorization header.

**Base URL:** `https://api.firecrawl.dev`

**API Version:** v2 (current)

## Core Endpoints

### 1. Scrape (`POST /v2/scrape`)

Extracts content from a single URL in multiple LLM-ready formats.

**Use Cases:**
- Single page content extraction
- Getting page content in markdown for LLM consumption
- Extracting structured data from a specific page
- Taking screenshots of web pages
- Processing PDFs, DOCX, and images

**Key Features:**
- **Output Formats:** markdown, HTML, screenshot, links, metadata, changeTracking
- **JavaScript Rendering:** Automatically handles SPAs (React, Vue, Angular)
- **Actions:** Programmatic interactions (click, scroll, wait, type)
- **LLM Extract:** Extract structured data using AI with a schema or prompt
- **FIRE-1 Agent:** Optional intelligent agent for complex navigation tasks

**Parameters:**
- `url` (required) - The URL to scrape
- `formats` - Array of output formats: `["markdown", "html", "screenshot", "links", "changeTracking"]`
- `onlyMainContent` - Extract only main content, excluding headers/footers
- `includeTags` / `excludeTags` - Filter HTML elements
- `waitFor` - Milliseconds to wait for dynamic content
- `timeout` - Maximum wait time
- `actions` - Array of browser actions to perform before scraping

**Actions Example:**
```json
{
  "url": "https://example.com",
  "actions": [
    {"type": "wait", "milliseconds": 2000},
    {"type": "click", "selector": ".load-more"},
    {"type": "scroll", "direction": "down"},
    {"type": "write", "text": "search query", "selector": "input[name='q']"},
    {"type": "press", "key": "ENTER"},
    {"type": "wait", "milliseconds": 1000},
    {"type": "screenshot"}
  ]
}
```

**Available Action Types:**
- `wait` – pause for specified milliseconds
- `click` – click an element by CSS selector
- `scroll` – scroll in a direction (`up`, `down`)
- `write` – type text into an input element (requires `selector` and `text`)
- `press` – press a keyboard key (e.g., `ENTER`, `TAB`)
- `screenshot` – capture screenshot mid-action (in addition to format option)

**FIRE-1 Agent Example (intelligent navigation):**
```bash
curl -X POST https://api.firecrawl.dev/v2/scrape \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fc-YOUR_API_KEY' \
  -d '{
    "url": "https://www.ycombinator.com/companies",
    "formats": ["markdown"],
    "agent": {
      "model": "FIRE-1",
      "prompt": "Search for firecrawl and go to the company page"
    }
  }'
```

---

### 2. Crawl (`POST /v2/crawl`)

Recursively traverses a website, extracting content from all discovered subpages.

**Use Cases:**
- Website-wide data collection
- Building knowledge bases from documentation sites
- Indexing entire domains for search or RAG applications
- Content migration projects

**How It Works:**
1. Analyzes starting URL (sitemap + page traversal)
2. Recursively follows links to discover subpages
3. Scrapes content from each page
4. Compiles results into structured data

**Key Parameters:**
- `url` (required) - Starting URL
- `limit` - Maximum number of pages to crawl
- `maxDepth` - Maximum link depth to follow
- `includePaths` / `excludePaths` - URL path filters (regex supported)
- `allowBackwardLinks` - Allow crawling parent directories
- `allowExternalLinks` - Allow crawling external domains
- `sitemap` - Options: "include" (default), "only", "ignore"
- `scrapeOptions` - Same options as /scrape endpoint
- `webhook` - URL to receive results asynchronously

**Response:** Returns a job ID for async status checking via `GET /v2/crawl/{id}`

---

### 3. Map (`POST /v2/map`)

Rapidly discovers all URLs on a website without scraping content.

**Use Cases:**
- Quick site structure analysis
- Pre-crawl discovery to plan targeted scraping
- Finding specific pages before scraping
- Sitemap generation

**Parameters:**
- `url` (required) - The website URL to map
- `search` - Optional filter to find URLs related to specific topics
- `ignoreSitemap` - Skip sitemap and discover via page traversal
- `includeSubdomains` - Include subdomain URLs
- `limit` - Maximum URLs to return

**Example Response:**
```json
{
  "status": "success",
  "links": [
    "https://example.com",
    "https://example.com/about",
    "https://example.com/blog",
    "https://example.com/blog/post-1"
  ]
}
```

**Credit Cost:** 1 credit per call (regardless of URLs found)

---

### 4. Search (`POST /v2/search`)

Combines web search with content scraping in a single API call.

**Use Cases:**
- Research automation
- Finding and extracting data on specific topics
- Lead generation
- SEO analysis and competitive research
- Building AI agents that search the web

**How It Works:**
1. Performs web search for the query
2. Optionally scrapes content from each result
3. Returns search results with full page content

**Parameters:**
- `query` (required) - Search query string
- `limit` - Number of results (default: 5)
- `lang` - Language code (e.g., "en")
- `country` - Country code (e.g., "us")
- `tbs` - Time-based search filter
- `scrapeOptions` - Apply scraping to each result

**Credit Cost:** 2 credits per 10 results

---

### 5. Agent (`POST /v2/agent`)

**The next evolution of /extract.** Uses AI agents (powered by FIRE-1) to autonomously search, navigate, and gather structured data from across the web. Unlike /extract, Agent requires only a prompt—URLs are optional.

**Use Cases:**
- **Lead generation** – Find companies matching criteria and extract contact info
- **Competitive intelligence** – Gather pricing data across competitors
- **Research & dataset curation** – Collect research papers, technical specs, company data
- **Complex multi-page workflows** – Handle pagination, form submissions, multi-step flows
- **Discovery tasks** – Find information when you don't know which URLs to scrape

**Key Capabilities:**
- **Built-in web search** – No URLs required; agent finds relevant sources
- **Autonomous navigation** – Clicks buttons, follows links, handles pagination
- **Dynamic content handling** – Processes JavaScript-heavy sites and interactive elements
- **Structured output** – Returns clean JSON based on schema or prompt
- **FIRE-1 Model** – Purpose-built AI agent for web interaction

**How It Differs from /extract:**
- `/extract` requires URLs; `/agent` makes URLs optional
- `/agent` has built-in search to discover sources autonomously
- `/agent` can navigate multi-page flows (pagination, clicks, forms)
- `/extract` is being deprecated in favor of `/agent`

**Parameters:**
- `prompt` (required) – Natural language description of what data to gather (max 10,000 chars)
- `urls` (optional) – Starting URLs to focus the search
- `schema` (optional) – JSON Schema or Zod schema for structured output
- `maxCredits` (optional) – Maximum credits to spend on this agent task
- `strictConstrainToURLs` (optional) – If true, agent only visits URLs in the `urls` array
- `pageDetails` (optional) – Include page details in response
- `include_image` (optional) – Include images in response
- `include_link` (optional) – Include links in response
- `include_raw_content` (optional) – Include raw HTML content in response

**Response Fields:**
- `success` – boolean indicating operation success
- `status` – `"completed"`, `"processing"`, etc.
- `data` – extracted data matching the schema
- `creditsUsed` – number of credits consumed
- `expiresAt` – expiration timestamp for the result

**Direct API Example:**
```bash
curl -X POST https://api.firecrawl.dev/v2/agent \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fc-YOUR_API_KEY' \
  -d '{
    "prompt": "Find the top 5 YC W24 dev tool companies and get their name, website, and what they do"
  }'
```

**Node.js SDK Example (with Zod Schema):**
```javascript
import Firecrawl from '@mendable/firecrawl-js';
import { z } from 'zod';

const app = new Firecrawl({ apiKey: 'fc-YOUR_API_KEY' });

const schema = z.object({
  companies: z.array(z.object({
    name: z.string(),
    website: z.string(),
    description: z.string(),
    funding: z.string().optional()
  })).describe('List of companies')
});

const result = await app.agent({
  prompt: 'Find AI infrastructure startups that raised Series A in 2024',
  schema
});

console.log(result.data);
```

**Node.js SDK Example (with Starting URLs):**
```javascript
const result = await app.agent({
  prompt: 'Extract all product names, prices, and specifications',
  urls: ['https://example-store.com/products']
});
```

**Status:** Currently in research preview. Available via API, Node SDK, Python SDK, and Playground.

#### `/search` vs `/agent` — When to Use Which

Both endpoints can find information on the web, but they serve different purposes:

**Use `/search` when:**
- Speed matters — `/search` is a single fast operation
- Cost matters — 2 credits per 10 results vs higher agent costs
- You need raw content — search results + markdown to process yourself
- Predictable patterns — same search type every time (e.g., "find GitHub repos for X")

**Use `/agent` when:**
- Data is scattered across multiple sites requiring navigation
- You need structured JSON output, not raw content
- Complex research — cross-referencing sources, following links
- Data is behind clicks/pagination/forms
- You don't know the exact URLs upfront

**Think of it as:** `/search` = Google search + scrape (fast, cheap), `/agent` = AI research assistant browsing for you (thorough, intelligent)

---

### 6. Extract (`POST /v2/extract`) ⚠️ Deprecated

> **Note:** /extract is being deprecated in favor of the more powerful /agent endpoint. Consider migrating to /agent for new projects.

Uses AI to extract structured data from web pages based on a schema or natural language prompt.

**Use Cases:**
- Extracting product information from e-commerce sites
- Pulling company data from business directories
- Collecting structured data without writing parsers
- Research data aggregation

**Key Features:**
- **Schema-based extraction:** Define output structure with JSON Schema or Zod
- **Prompt-based extraction:** Use natural language descriptions
- **Multi-page extraction:** Process multiple URLs or entire domains with wildcards
- **FIRE-1 Agent support:** Use `agent: { model: "FIRE-1" }` for complex navigation

**Parameters:**
- `urls` (required) – Array of URLs (supports wildcards like `example.com/*`)
- `prompt` – Natural language description of data to extract
- `schema` – JSON Schema defining the output structure
- `agent` – Optional agent config for complex interactions (e.g., `{ model: "FIRE-1" }`)
- `enableWebSearch` – When true, extraction can follow links outside specified domains

**Direct API Example:**
```bash
curl -X POST https://api.firecrawl.dev/v2/extract \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fc-YOUR_API_KEY' \
  -d '{
    "urls": ["https://example.com/products/*"],
    "prompt": "Extract product name, price, and description",
    "schema": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "price": {"type": "number"},
        "description": {"type": "string"}
      },
      "required": ["name", "price"]
    }
  }'
```

---

### 7. Batch Scrape (`POST /v2/batch/scrape`)

Scrapes multiple URLs simultaneously in a single job.

**Use Cases:**
- Processing a list of known URLs
- Bulk data collection
- When you have specific URLs (vs. discovering via crawl)

**Parameters:**
- `urls` (required) - Array of URLs to scrape
- `scrapeOptions` - Scraping options applied to all URLs

**Response:** Returns a job ID for async status checking

---

## Advanced Features

### Change Tracking

Monitor website changes by comparing current scrapes to previous versions. Firecrawl automatically detects if content is new, unchanged, modified, or removed.

**Enable via format:** Add `"changeTracking"` to the formats array.

**Response Fields:**
- `previousScrapeAt` – timestamp of last scrape (or `null` if first scrape)
- `changeStatus` – `"new"`, `"same"`, `"changed"`, or `"removed"`
- `visibility` – `"visible"` (found via crawl) or `"hidden"` (found via memory)
- `diff` (optional) – git-style diff of changes
- `json` (optional) – structured JSON comparison of specific fields

**Basic Example:**
```javascript
const result = await app.scrapeUrl("https://example.com/pricing", {
  formats: ["markdown", "changeTracking"]
});

console.log(result.changeTracking.changeStatus); // "changed"
console.log(result.changeTracking.previousScrapeAt);
```

**Advanced Example (with diff modes and schema):**
```javascript
const result = await app.scrapeUrl("https://example.com/products", {
  formats: ["markdown", "changeTracking"],
  changeTrackingOptions: {
    modes: ["git-diff", "json"],
    schema: {
      type: "object",
      properties: {
        price: { type: "string" },
        stock: { type: "string" }
      }
    },
    prompt: "Track price and stock changes"
  }
});

// Git-style diff
if (result.changeTracking.diff) {
  console.log(result.changeTracking.diff.text);
  console.log(result.changeTracking.diff.json);
}

// Structured JSON comparison
if (result.changeTracking.json) {
  console.log(result.changeTracking.json); // { previous: {...}, current: {...} }
}
```

**Use Cases:**
- Price monitoring and alerts
- Content change detection for news/blogs
- Competitive intelligence tracking
- Compliance monitoring

**Notes:**
- Comparison is resilient to whitespace and content order changes
- Iframe source URLs are ignored to avoid false positives from captchas/antibots

---

## Pricing & Credits

Firecrawl uses a credit-based pricing model:

**Standard Credit Costs:**
- **Scrape/Crawl:** 1 credit per page
- **Map:** 1 credit per call
- **Search:** 2 credits per 10 results
- **Extract:** Additional credits based on AI token usage
- **Stealth Mode:** 5 credits per request

**Pricing Tiers:**
- **Free:** 500 credits (no credit card required)
- **Hobby ($20/mo):** ~3,000 credits
- **Growth ($333/mo):** 500,000 credits, 100 concurrent browsers
- **Scale ($500/mo):** 300,000+ credits
- **Enterprise:** Custom pricing, unlimited credits, SLA

**Notes:**
- Failed requests don't consume credits
- Extra credits available via auto-recharge packs
- Extract has separate plans ($89-$719/mo) for high-volume AI extraction

---

## Best Practices

### Optimizing Credit Usage

- **Request only needed formats** - Don't request `["markdown", "html", "screenshot"]` if you only need markdown
- **Use caching** - Results may be cached; avoid redundant requests
- **Use Map before Crawl** - Discover site structure first, then target specific sections
- **Filter paths** - Use `includePaths`/`excludePaths` to avoid irrelevant pages

### Handling Dynamic Content

- **Prefer smart waits over fixed delays** - Firecrawl has built-in smart waiting
- **Use `waitFor` sparingly** - Only add extra wait time when needed
- **Chain actions for infinite scroll:**
```json
{
  "actions": [
    {"type": "scroll", "direction": "down"},
    {"type": "wait", "milliseconds": 2000},
    {"type": "scroll", "direction": "down"},
    {"type": "wait", "milliseconds": 2000}
  ]
}
```

### Rate Limits

- Rate limits vary by plan (Free: ~5 RPM, Enterprise: 100+ RPM)
- Implement exponential backoff on 429 responses
- Process URLs in smaller batches
- Monitor usage dashboard

### Error Handling

- Check for 429 (rate limit) and implement retry with backoff
- Failed scrapes return errors without charging credits
- Monitor webhook endpoints for crawl job failures

---

## Quick Reference

### Installation (Node.js)

```bash
npm install @mendable/firecrawl-js
```

### Node.js SDK Examples

```javascript
import Firecrawl from '@mendable/firecrawl-js';

const app = new Firecrawl({ apiKey: 'fc-YOUR_API_KEY' });

// Scrape single URL
const scrapeResult = await app.scrape('https://firecrawl.dev', {
  formats: ['markdown', 'html', 'links'],
  timeout: 30000,
  waitFor: 2000
});
console.log(scrapeResult.markdown);

// Crawl website with options
const crawlResult = await app.crawl('https://docs.firecrawl.dev', {
  limit: 100,
  maxDepth: 3,
  scrapeOptions: { formats: ['markdown'] },
  excludePaths: ['blog/*', 'admin/*'],
  includePaths: ['docs/**']
});
console.log(`Crawled ${crawlResult.data.length} pages`);

// Map website URLs
const mapResult = await app.map('https://firecrawl.dev');
console.log(mapResult.links);

// Search the web
const searchResult = await app.search('what is web scraping?', {
  limit: 5,
  lang: 'en',
  country: 'us',
  scrapeOptions: { formats: ['markdown'] }
});
searchResult.data.forEach(result => {
  console.log(`${result.title}: ${result.url}`);
});

// Agent (autonomous data gathering)
const agentResult = await app.agent({
  prompt: 'Find top 5 AI startups and extract their name, funding, and description'
});
console.log(agentResult.data);

// Change Tracking (monitor website changes)
const trackResult = await app.scrape('https://example.com/pricing', {
  formats: ['markdown', 'changeTracking']
});
if (trackResult.changeTracking.changeStatus === 'changed') {
  console.log('Content changed since:', trackResult.changeTracking.previousScrapeAt);
}
```

### Direct API Examples (cURL)

```bash
# Scrape a URL
curl -X POST https://api.firecrawl.dev/v2/scrape \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fc-YOUR_API_KEY' \
  -d '{"url": "https://example.com", "formats": ["markdown"]}'

# Crawl a website
curl -X POST https://api.firecrawl.dev/v2/crawl \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fc-YOUR_API_KEY' \
  -d '{"url": "https://example.com", "limit": 100}'

# Map website URLs
curl -X POST https://api.firecrawl.dev/v2/map \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fc-YOUR_API_KEY' \
  -d '{"url": "https://example.com"}'

# Search the web
curl -X POST https://api.firecrawl.dev/v2/search \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fc-YOUR_API_KEY' \
  -d '{"query": "AI web scraping tools", "limit": 5}'

# Agent (autonomous extraction)
curl -X POST https://api.firecrawl.dev/v2/agent \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fc-YOUR_API_KEY' \
  -d '{"prompt": "Find AI startups and get their name and funding"}'
```

### Extract with Zod Schema (Node.js)

```javascript
import Firecrawl from '@mendable/firecrawl-js';
import { z } from 'zod';

const app = new Firecrawl({ apiKey: 'fc-YOUR_API_KEY' });

const schema = z.object({
  top: z.array(z.object({
    title: z.string(),
    points: z.number(),
    by: z.string(),
    commentsURL: z.string()
  })).length(5).describe('Top 5 stories on Hacker News')
});

const result = await app.extract({
  urls: ['https://news.ycombinator.com'],
  schema,
  prompt: 'Extract the top 5 stories'
});

console.log(result);
```

---

## Resources

- [Official Documentation](https://docs.firecrawl.dev)
- [API Reference](https://docs.firecrawl.dev/api-reference/introduction)
- [Agent Documentation](https://docs.firecrawl.dev/features/agent)
- [Change Tracking Documentation](https://docs.firecrawl.dev/features/change-tracking)
- [Introducing Agent Blog Post](https://www.firecrawl.dev/blog/introducing-agent)
- [GitHub Repository](https://github.com/firecrawl/firecrawl)
- [Changelog](https://www.firecrawl.dev/changelog)
- [Pricing](https://www.firecrawl.dev/pricing)
- [llms.txt](https://www.firecrawl.dev/llms.txt) – Indexed Firecrawl docs for LLMs
- [llms-full.txt](https://www.firecrawl.dev/llms-full.txt) – Full Firecrawl docs for LLMs
