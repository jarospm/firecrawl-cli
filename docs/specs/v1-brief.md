# Firecrawl CLI Tool Brief

> Problem definition and requirements for a reusable Firecrawl-powered CLI tool

## Problem Statement

Web research and scraping is a recurring need across multiple contexts:

1. **Workflow automation** – AI agents that need to research companies, topics, or gather data as part of a larger workflow (e.g., prospect research, competitive analysis, content curation)

2. **Ad-hoc development research** – During a Claude Code session, encountering a relevant article/post and wanting to scrape it to include insights into the current work

3. **Dedicated topic research** – Needing deep research on a topic, potentially followed by targeted scraping of discovered sources

Currently, each project reinvents web research tooling. There's no reusable, Claude Code-friendly interface to Firecrawl.

## Goals

- **Reusable** – Single tool/toolset usable across multiple Claude Code projects
- **Claude Code native** – Designed to be invoked by Claude Code (via skills, MCP, or direct CLI)
- **Human-friendly** – Also usable directly from the command line by developers
- **Composable** – Can be combined into larger workflows or used standalone
- **LLM-optimized output** – Returns markdown/structured data ready for LLM consumption

## Non-Goals

- Building a full web scraping framework
- Replacing Firecrawl's own CLI (if one exists)
- GUI or web interface
- Managing Firecrawl API keys (assumes env var)

## Use Cases

### UC1: Scrape a specific URL

During development, I find a relevant article and want its content.

```bash
# Human usage
firecrawl scrape https://example.com/article

# Claude Code skill invocation
/firecrawl-scrape https://example.com/article
```

**Output:** Markdown content of the page, ready to paste into context or save.

### UC2: Search the web for a topic

I need to find relevant sources on a topic before deciding what to scrape.

```bash
# Human usage
firecrawl search "nextjs server actions best practices"

# Claude Code skill invocation
/firecrawl-search "nextjs server actions best practices"
```

**Output:** List of URLs with titles and snippets, optionally with scraped content.

### UC3: Research a topic (search + scrape)

Comprehensive research: search for sources, then scrape the top results.

```bash
# Human usage
firecrawl research "React Server Components patterns" --depth 5

# Claude Code skill invocation
/firecrawl-research "React Server Components patterns"
```

**Output:** Combined markdown document with content from multiple sources.

### UC4: Map a website structure

Understand what pages exist on a site before targeted scraping.

```bash
firecrawl map https://docs.example.com
```

**Output:** List of URLs discovered on the site.

### UC5: Agent-powered data gathering

Complex research requiring navigation, clicking, pagination.

```bash
firecrawl agent "Find the top 5 YC W24 AI startups and their funding amounts"
```

**Output:** Structured JSON or markdown with the gathered data.

### UC6: Workflow integration (programmatic)

An AI agent workflow needs to call Firecrawl as part of its execution.

```javascript
// Within a Claude Code skill or script
const results = await firecrawl.search("company X API documentation");
const content = await firecrawl.scrape(results[0].url);
```

## User Personas

### Developer (direct CLI usage)

- Runs commands directly in terminal
- Wants quick, copy-pasteable output
- May pipe output to files or other tools

### Claude Code (AI invocation)

- Invokes tool via skill, MCP server, or bash command
- Needs structured, predictable output format
- May chain multiple calls together

### Workflow author (skill/agent builder)

- Imports tool functionality into larger workflows
- Needs programmatic API (JS/TS)
- Cares about error handling and retries

## Open Questions (for architecture discussion)

### Tool structure

- **One tool vs many?** – Single `firecrawl` CLI with subcommands, or separate `firecrawl-scrape`, `firecrawl-search`, etc.?
- **Tradeoffs:** Single tool is simpler to install/manage. Multiple tools are more composable and clearer in intent.

### Implementation approach

- **Node.js SDK** – Use `@mendable/firecrawl-js`, compile to standalone binary or run via npx
- **Direct API calls** – Shell script with curl, no dependencies
- **Hybrid** – Node.js wrapper that can also be called as shell commands

### Claude Code integration

- **Bash tool** – Claude Code calls CLI via Bash tool
- **MCP server** – Expose Firecrawl as MCP tools (richer integration)
- **Skills** – Claude Code skills that wrap the CLI
- **Combination** – Multiple integration points

### Output format

- **Markdown** – Best for LLM consumption and human readability
- **JSON** – Best for programmatic use and structured data
- **Configurable** – Flag to choose format (default: markdown)

### Caching / rate limiting

- Should the tool cache results to avoid redundant API calls?
- How to handle rate limits gracefully?

### Error handling

- Best-effort (continue with partial results) vs fail-fast?
- How verbose should error messages be?

## Firecrawl Capabilities Reference

The tool should expose these Firecrawl endpoints (see [firecrawl-api.md](./firecrawl-api.md) for details):

| Endpoint  | Purpose                        | CLI mapping      |
| --------- | ------------------------------ | ---------------- |
| `/scrape` | Single page content extraction | `scrape <url>`   |
| `/search` | Web search + optional scrape   | `search <query>` |
| `/map`    | Discover all URLs on a site    | `map <url>`      |
| `/crawl`  | Recursive site crawling        | `crawl <url>`    |
| `/agent`  | AI-powered data gathering      | `agent <prompt>` |

### Key parameters to expose

**Scrape:**

- `--formats` – markdown, html, links, screenshot
- `--wait` – Wait time for JS rendering
- `--only-main` – Extract only main content

**Search:**

- `--limit` – Number of results
- `--scrape` – Also scrape content from results
- `--lang`, `--country` – Localization

**Crawl:**

- `--limit` – Max pages
- `--depth` – Max link depth
- `--include`, `--exclude` – Path filters

**Agent:**

- `--schema` – JSON schema for structured output
- `--urls` – Optional starting URLs

## Success Criteria

1. **Developer can scrape a URL in one command** – `firecrawl scrape <url>` returns markdown
2. **Claude Code can invoke tool** – Works via Bash tool or skill
3. **Output is LLM-ready** – Markdown format, reasonable length, clean content
4. **Reusable across projects** – Single install, works everywhere
5. **Integrates with workflows** – Can be called from Claude Code skills and AI agent workflows

## References

- [Firecrawl API Documentation](./README.md) – Full endpoint reference
- [Firecrawl Official Docs](https://docs.firecrawl.dev)
- [Firecrawl Node.js SDK](https://www.npmjs.com/package/@mendable/firecrawl-js)
- [llms.txt](https://www.firecrawl.dev/llms.txt) – Indexed docs for LLMs
- [llms-full.txt](https://www.firecrawl.dev/llms-full.txt) – Full docs for LLMs

## Next Steps

1. **Architecture decision** – One tool vs multiple, Node vs curl
2. **Prototype** – Build minimal `scrape` and `agent` commands
3. **Claude Code integration** – Test invocation patterns
4. **Iterate** – Add remaining commands based on usage
