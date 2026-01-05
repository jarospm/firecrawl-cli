# Firecrawl CLI v1 Specification

> Generated from: docs/specs/v1-brief.md
> Interview completed: 2026-01-05

## Overview

A TypeScript CLI tool that wraps the Firecrawl API, designed primarily for use by Claude Code via bash invocation, but also usable directly by developers. The CLI provides commands for web scraping, search, site mapping, crawling, and AI-powered data gathering.

## Goals & Non-Goals

### Goals

- **Reusable** – Single tool usable across multiple Claude Code projects
- **Claude Code native** – Designed to be invoked via Bash tool
- **Human-friendly** – Also usable directly from the command line
- **LLM-optimized output** – Returns markdown by default, ready for LLM consumption
- **Simple** – Minimal configuration, sensible defaults

### Non-Goals

- MCP server integration (may add later)
- GUI or web interface
- Managing Firecrawl API keys (assumes env var)
- Caching or result persistence
- Full web scraping framework
- Automated tests in v1

## Technical Design

### Project Structure

```
firecrawl-cli/
├── src/
│   ├── cli.ts              # Entry point, command registration
│   ├── commands/
│   │   ├── scrape.ts       # Scrape command
│   │   ├── search.ts       # Search command
│   │   ├── map.ts          # Map command
│   │   ├── crawl.ts        # Crawl command
│   │   └── agent.ts        # Agent command
│   ├── lib/
│   │   ├── firecrawl.ts    # Firecrawl SDK wrapper
│   │   ├── output.ts       # Output formatting (markdown/JSON)
│   │   └── progress.ts     # Progress/status display
│   └── types/
│       └── index.ts        # Shared TypeScript types
├── package.json
├── tsconfig.json
└── README.md
```

### Technology Stack

- **Runtime:** Node.js >=20.0.0
- **Language:** TypeScript
- **Execution:** tsx (TypeScript execution without build step)
- **CLI framework:** cmd-ts (type-safe argument parsing)
- **API client:** @mendable/firecrawl-js (official SDK)

### Dependencies

```json
{
  "dependencies": {
    "@mendable/firecrawl-js": "^1.x",
    "cmd-ts": "^0.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "tsx": "^4.x",
    "@types/node": "^20.x"
  }
}
```

### API Key Configuration

The Firecrawl API key is read from the `FIRECRAWL_API_KEY` environment variable.

**Missing key behavior:**

```
Error: FIRECRAWL_API_KEY environment variable is not set.

To get an API key:
1. Sign up at https://firecrawl.dev
2. Copy your API key from the dashboard
3. Set the environment variable:
   export FIRECRAWL_API_KEY=your_key_here
```

## Commands

### Global Flags

All commands support these flags:

- `--json` – Output as JSON instead of markdown
- `--quiet` – Suppress progress and status messages
- `--verbose` – Show detailed progress information
- `--version` – Show CLI version
- `--help` – Show help for command

### `scrape <url>`

Scrape a single URL and return its content.

**Arguments:**

- `url` (required) – The URL to scrape

**Flags:**

- `--formats <types>` – Content formats to extract (default: markdown)
  - Options: markdown, html, links, screenshot
- `--only-main` – Extract only main content, excluding navigation/headers/footers
- `--wait <ms>` – Additional wait time for JavaScript rendering

**Default output (markdown):**

```markdown
# Page Title

[Page content as clean markdown...]
```

**JSON output (--json):**

```json
{
  "url": "https://example.com/page",
  "title": "Page Title",
  "content": "# Page Title\n\n[markdown content]",
  "metadata": {
    "description": "...",
    "language": "en"
  }
}
```

**Example:**

```bash
firecrawl-cli scrape https://docs.firecrawl.dev/introduction

# With options
firecrawl-cli scrape https://example.com --only-main --json
```

### `search <query>`

Search the web and return results.

**Arguments:**

- `query` (required) – The search query

**Flags:**

- `--limit <n>` – Number of results (default: Firecrawl default, typically 10)
- `--scrape` – Also scrape content from each result
- `--lang <code>` – Language code (e.g., en, es, de)
- `--country <code>` – Country code (e.g., us, uk, de)

**Default output (markdown):**

```markdown
## Search Results for "query"

1. **Result Title**
   https://example.com/page
   Snippet text describing the result...

2. **Another Result**
   https://example.org/article
   Another snippet...
```

**With --scrape (markdown):**

```markdown
## Search Results for "query"

---

### Result 1: Page Title

**URL:** https://example.com/page

[Full scraped content...]

---

### Result 2: Another Page

**URL:** https://example.org/article

[Full scraped content...]
```

**JSON output (--json):**

```json
{
  "query": "search query",
  "results": [
    {
      "title": "Result Title",
      "url": "https://example.com/page",
      "snippet": "Description text...",
      "content": "[if --scrape was used]"
    }
  ]
}
```

**Example:**

```bash
firecrawl-cli search "nextjs server actions best practices"

# With scraping
firecrawl-cli search "react hooks tutorial" --scrape --limit 3
```

### `map <url>`

Discover all URLs on a website.

**Arguments:**

- `url` (required) – The starting URL to map

**Flags:**

- `--limit <n>` – Maximum URLs to discover

**Default output (plain text, one URL per line):**

```
https://example.com/
https://example.com/about
https://example.com/products
https://example.com/products/item-1
https://example.com/contact
```

**JSON output (--json):**

```json
{
  "baseUrl": "https://example.com",
  "urls": [
    "https://example.com/",
    "https://example.com/about",
    "https://example.com/products"
  ],
  "count": 3
}
```

**Example:**

```bash
firecrawl-cli map https://docs.example.com

# Pipe to other tools
firecrawl-cli map https://docs.example.com | head -20
```

### `crawl <url>`

Recursively crawl a website and return content from multiple pages.

**Arguments:**

- `url` (required) – The starting URL to crawl

**Flags:**

- `--limit <n>` – Maximum pages to crawl (default: 50)
- `--depth <n>` – Maximum link depth (default: 3)

**Default output (markdown, concatenated with separators):**

```markdown
# Crawl Results: https://example.com

---

## Page 1: Homepage

**URL:** https://example.com/

[Page content...]

---

## Page 2: About Us

**URL:** https://example.com/about

[Page content...]

---

## Page 3: Products

**URL:** https://example.com/products

[Page content...]
```

**JSON output (--json):**

```json
{
  "baseUrl": "https://example.com",
  "pages": [
    {
      "url": "https://example.com/",
      "title": "Homepage",
      "content": "[markdown content]"
    },
    {
      "url": "https://example.com/about",
      "title": "About Us",
      "content": "[markdown content]"
    }
  ],
  "count": 2
}
```

**Async behavior:**
The crawl command polls the Firecrawl API until the job completes. Progress is shown to stderr:

```
Crawling https://example.com...
Progress: 15/50 pages crawled
Progress: 32/50 pages crawled
Crawl complete: 47 pages
```

**Example:**

```bash
firecrawl-cli crawl https://docs.example.com --limit 100 --depth 2

# Quiet mode for scripts
firecrawl-cli crawl https://docs.example.com --quiet > output.md
```

### `agent <prompt>`

Use AI-powered browsing to gather data based on a natural language prompt.

**Arguments:**

- `prompt` (required) – Natural language description of what to find

**Flags:**

- `--url <url>` – Optional starting URL(s) to guide the agent (can be repeated)
- `--schema <file>` – Path to JSON schema file for structured output

**Default output (markdown):**

```markdown
# Agent Results

[AI-generated markdown with findings...]
```

**With --schema (JSON):**

```json
{
  "startups": [
    {
      "name": "Example AI",
      "funding": "$5M",
      "description": "AI-powered widgets"
    }
  ]
}
```

**Async behavior:**
Like crawl, the agent command polls until completion:

```
Agent working on: "Find top YC W24 AI startups..."
Status: Searching...
Status: Browsing ycombinator.com...
Status: Extracting data...
Agent complete
```

**Example:**

```bash
firecrawl-cli agent "Find the top 5 YC W24 AI startups and their funding amounts"

# With starting URL
firecrawl-cli agent "Find pricing information" --url https://stripe.com

# With schema
firecrawl-cli agent "Find YC startups" --schema ./startup-schema.json
```

## Output Behavior

### Stream Separation

- **stdout** – Primary content (markdown or JSON)
- **stderr** – Progress, status messages, warnings, errors

This allows clean piping:

```bash
firecrawl-cli scrape https://example.com > content.md
firecrawl-cli crawl https://example.com 2>/dev/null > content.md
```

### Output Flags

- Default: Markdown formatted for LLM/human readability
- `--json`: Machine-readable JSON
- `--quiet`: Suppress all stderr output
- `--verbose`: Detailed progress to stderr

### Error Handling

**Best-effort behavior:**
When processing multiple items (search with --scrape, crawl), failures on individual items don't stop the process:

```
Crawling https://example.com...
Warning: Failed to scrape https://example.com/broken-page (404)
Progress: 15/50 pages crawled
Warning: Failed to scrape https://example.com/timeout (timeout)
Progress: 32/50 pages crawled
Crawl complete: 47 pages (2 failures)
```

Partial results are returned. Exit code is 0 if any results were obtained.

**Exit codes:**

- `0` – Success (full or partial)
- `1` – Complete failure (no results)
- `2` – Configuration error (missing API key, invalid arguments)

## Development Setup

### Installation

```bash
cd firecrawl-cli
npm install
npm link  # Makes 'firecrawl-cli' available globally
```

### Running

```bash
# Via npm link
firecrawl-cli scrape https://example.com

# Direct execution
npx tsx src/cli.ts scrape https://example.com

# With environment variable
FIRECRAWL_API_KEY=your_key firecrawl-cli scrape https://example.com
```

### Project Scripts

```json
{
  "scripts": {
    "dev": "tsx src/cli.ts",
    "typecheck": "tsc --noEmit"
  },
  "bin": {
    "firecrawl-cli": "./src/cli.ts"
  }
}
```

## Claude Code Integration

### Invocation Pattern

Claude Code invokes via Bash tool:

```bash
firecrawl-cli scrape https://example.com/article
```

### Example Claude Code Usage

```
User: Can you research best practices for React Server Components?

Claude: I'll search for relevant articles on this topic.
[Uses Bash: firecrawl-cli search "React Server Components best practices" --scrape --limit 3]

Based on the scraped content, here are the key best practices...
```

### Output Consumption

Markdown output is directly consumable by Claude Code. For programmatic processing within skills or scripts, use `--json`.

## Edge Cases & Constraints

### URL Validation

- URLs must include protocol (https:// or http://)
- Invalid URLs exit with error code 2 and helpful message

### Rate Limiting

- Firecrawl API handles rate limiting
- CLI receives 429 errors and reports them
- No automatic retry (user can re-run)

### Large Content

- No built-in truncation
- Very large crawls may produce substantial output
- User can pipe through `head` or limit with `--limit`

### JavaScript Rendering

- Firecrawl handles JavaScript rendering by default
- No additional flags needed for SPAs
- Agent command handles complex interactions automatically

## Future Considerations (Not in v1)

- **MCP server mode** – For richer Claude Code integration
- **Caching** – Avoid redundant API calls
- **Include/exclude filters** – For crawl command
- **Retry logic** – Automatic retry on transient failures
- **esbuild compilation** – For npm distribution
- **Automated tests** – Unit and integration tests

## Appendix

### Interview Notes

Key decisions made during specification:

- **Node.js with official SDK** chosen over curl/shell scripts for better error handling and TypeScript support
- **Single CLI with subcommands** (like git) rather than separate binaries for simpler installation
- **Bash invocation only** for v1 – MCP server deferred to simplify initial implementation
- **Markdown default** with `--json` flag – optimized for LLM consumption
- **Best-effort error handling** – partial results preferred over fail-fast for research workflows
- **No caching** – simplicity over API credit optimization
- **tsx only** for v1 – no build step, esbuild can be added when publishing to npm
- **cmd-ts** chosen over Commander.js for type-safe argument parsing
- **Crawl filters deferred** – keep v1 simple, add `--include`/`--exclude` if needed later
