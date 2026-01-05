# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev -- <command>    # Run CLI during development (e.g., npm run dev -- scrape https://example.com)
npm run typecheck           # Type check with TypeScript
npm run lint                # Lint with ESLint
npm run lint:fix            # Lint and auto-fix
npm run format              # Format with Prettier
npm run check               # Run all checks (typecheck + lint + format:check)
```

After `npm link`, the CLI is available globally as `firecrawl-cli`.

## Architecture

This is a CLI tool for the Firecrawl API built with cmd-ts and TypeScript.

**Entry point**: `src/cli.ts` - Loads API key from `~/.config/firecrawl/.env` if not in environment, registers subcommands.

**Commands** (`src/commands/`): Each file exports a `command()` from cmd-ts with args definition and handler. Commands:
- `scrape` - Single URL content extraction
- `search` - Web search with optional content scraping
- `map` - Discover URLs on a website
- `crawl` - Recursive multi-page crawl with built-in polling
- `agent` - AI-powered data gathering with built-in polling

**Shared libraries** (`src/lib/`):
- `firecrawl.ts` - Singleton Firecrawl client from `@mendable/firecrawl-js` v4
- `output.ts` - Format output as markdown or JSON (content to stdout)
- `progress.ts` - Status/progress/warning/error messages (to stderr, respects --quiet/--verbose)
- `constants.ts` - Centralized defaults (timeouts, poll intervals, valid formats)
- `parse.ts` - Input parsing with validation (integers, URLs, formats, sitemap options)
- `type-guards.ts` - Safe SDK type narrowing for search results

**Output convention**: Content goes to stdout, progress/errors go to stderr. This enables piping (e.g., `firecrawl-cli scrape https://example.com > content.md`).

## Firecrawl SDK v4 Patterns

The SDK is `@mendable/firecrawl-js` v4. Key methods use built-in polling:

```typescript
// Crawl with automatic polling
const result = await client.crawl(url, {
  limit: 50,
  maxDiscoveryDepth: 3,
  scrapeOptions: { formats: ['markdown'] },
  pollInterval: 2,   // seconds
  timeout: 600,      // seconds
});

// Agent with automatic polling
const response = await client.agent({
  prompt,
  urls,
  schema,
  pollInterval: 2,
  timeout: 300,
});
```

Response data often requires type assertions since SDK returns `unknown` for flexible schemas.
