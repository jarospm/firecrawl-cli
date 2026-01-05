#!/usr/bin/env -S npx tsx

import { config } from 'dotenv';
import { homedir } from 'os';
import { join } from 'path';
import { run, subcommands, binary } from 'cmd-ts';

// Load from ~/.config/firecrawl/.env if FIRECRAWL_API_KEY not already set
if (!process.env['FIRECRAWL_API_KEY']) {
  config({ path: join(homedir(), '.config', 'firecrawl', '.env') });
}
import { scrape } from './commands/scrape.js';
import { search } from './commands/search.js';
import { map } from './commands/map.js';
import { crawl } from './commands/crawl.js';
import { agent } from './commands/agent.js';

const cli = subcommands({
  name: 'firecrawl-cli',
  description:
    'CLI tool for Firecrawl API - scrape, search, map, crawl, and AI-powered data gathering',
  version: '0.1.0',
  cmds: {
    scrape,
    search,
    map,
    crawl,
    agent,
  },
});

run(binary(cli), process.argv);
