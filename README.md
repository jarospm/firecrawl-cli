# firecrawl-cli

A command-line interface for the [Firecrawl](https://firecrawl.dev) API. Scrape websites, search the web, map site structures, crawl pages, and use AI-powered data gathering—all from your terminal.

Designed for use with [Claude Code](https://claude.ai/code) and AI agent workflows, but also works great as a standalone CLI tool.

## Setup

### Prerequisites

- Node.js >= 20.0.0
- A Firecrawl API key ([get one here](https://firecrawl.dev))

### Installation

```bash
# Clone and install
cd firecrawl-cli
npm install

# Link for global access
npm link
```

### Configuration

Create a config file at `~/.config/firecrawl/.env`:

```bash
mkdir -p ~/.config/firecrawl
echo "FIRECRAWL_API_KEY=your_api_key_here" > ~/.config/firecrawl/.env
```

This works from any directory, making it ideal for Claude Code and other tools.

Alternatively, set the environment variable directly:

```bash
export FIRECRAWL_API_KEY=your_api_key_here
```

## Usage

```bash
firecrawl-cli <command> [options]
```

### Commands

#### `scrape` - Extract content from a URL

```bash
# Basic usage
firecrawl-cli scrape https://example.com

# Output as JSON
firecrawl-cli scrape https://example.com --json

# Extract only main content (no nav/headers/footers)
firecrawl-cli scrape https://example.com --only-main

# Multiple formats
firecrawl-cli scrape https://example.com --formats markdown,html,links
```

**Options:**

- `--formats <types>` - Content formats: markdown, html, links, screenshot (default: markdown)
- `--only-main` - Extract only main content
- `--wait <ms>` - Wait time for JavaScript rendering
- `--json` - Output as JSON
- `--quiet` - Suppress progress messages

#### `search` - Search the web

```bash
# Basic search
firecrawl-cli search "nextjs server actions best practices"

# Limit results
firecrawl-cli search "react hooks" --limit 5

# Search and scrape content from results
firecrawl-cli search "typescript generics tutorial" --scrape

# Localized search
firecrawl-cli search "local news" --lang en --country us
```

**Options:**

- `--limit <n>` - Number of results
- `--scrape` - Also scrape content from each result
- `--lang <code>` - Language code (e.g., en, es, de)
- `--country <code>` - Country code (e.g., us, uk, de)
- `--json` - Output as JSON
- `--quiet` - Suppress progress messages

#### `map` - Discover URLs on a website

```bash
# Map a site
firecrawl-cli map https://docs.example.com

# Limit discovery
firecrawl-cli map https://docs.example.com --limit 100

# Filter by keyword
firecrawl-cli map https://docs.example.com --search "api"

# Include subdomains
firecrawl-cli map https://example.com --include-subdomains

# Pipe to other tools
firecrawl-cli map https://docs.example.com | head -20
```

**Options:**

- `--limit <n>` - Maximum URLs to discover
- `--search <keyword>` - Filter URLs by keyword
- `--include-subdomains` - Include URLs from subdomains
- `--sitemap <mode>` - Sitemap handling: 'only', 'include', or 'skip'
- `--json` - Output as JSON
- `--quiet` - Suppress progress messages

#### `crawl` - Recursively crawl a website

```bash
# Basic crawl
firecrawl-cli crawl https://docs.example.com

# With limits
firecrawl-cli crawl https://docs.example.com --limit 100 --depth 2

# Save to file
firecrawl-cli crawl https://docs.example.com --quiet > output.md
```

**Options:**

- `--limit <n>` - Maximum pages to crawl (default: 50)
- `--depth <n>` - Maximum link depth (default: 3)
- `--json` - Output as JSON
- `--quiet` - Suppress progress messages

#### `agent` - AI-powered data gathering

```bash
# Basic agent query
firecrawl-cli agent "Find the top 5 YC W24 AI startups and their funding"

# With starting URL
firecrawl-cli agent "Find pricing information" --url https://stripe.com

# With JSON schema for structured output
firecrawl-cli agent "Find company info" --schema ./schema.json

# Restrict agent to specific URLs only
firecrawl-cli agent "Extract all product names" --url https://shop.example.com --strict
```

**Options:**

- `--url <url>` - Starting URL(s) to guide the agent (comma-separated)
- `--schema <file>` - Path to JSON schema file for structured output
- `--strict` - Strictly constrain agent to provided URLs
- `--json` - Output as JSON
- `--quiet` - Suppress progress messages

### Global Options

All commands support:

- `--json` - Output as JSON instead of markdown
- `--quiet` - Suppress progress and status messages
- `--verbose` - Show detailed progress information
- `--help` - Show help for command

## Output

By default, output goes to stdout as markdown. Progress and errors go to stderr.

```bash
# Save output to file
firecrawl-cli scrape https://example.com > content.md

# Suppress progress, keep only content
firecrawl-cli crawl https://example.com --quiet > crawl.md

# JSON output for programmatic use
firecrawl-cli search "query" --json | jq '.results[0].url'
```

## Development

### Scripts

```bash
npm run dev           # Run CLI directly with tsx
npm run typecheck     # Type check with TypeScript
npm run lint          # Lint with ESLint
npm run lint:fix      # Lint and auto-fix
npm run format        # Format with Prettier
npm run format:check  # Check formatting
npm run check         # Run all checks
```

### Project Structure

```
src/
├── cli.ts              # Entry point
├── commands/
│   ├── scrape.ts
│   ├── search.ts
│   ├── map.ts
│   ├── crawl.ts
│   └── agent.ts
├── lib/
│   ├── firecrawl.ts    # API client wrapper
│   ├── output.ts       # Output formatting
│   ├── progress.ts     # Progress display
│   ├── constants.ts    # Shared constants and defaults
│   ├── parse.ts        # Input parsing utilities
│   └── type-guards.ts  # SDK type narrowing
└── types/
    └── index.ts
```

## Claude Code Integration

This CLI is designed to work seamlessly with Claude Code via the Bash tool:

```bash
# Claude Code can invoke directly
firecrawl-cli scrape https://docs.example.com/api

# Or search and scrape in one command
firecrawl-cli search "react query v5 migration" --scrape --limit 3
```

## License

MIT
