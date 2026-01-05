import Firecrawl from '@mendable/firecrawl-js';

let client: Firecrawl | null = null;

export function getClient(): Firecrawl {
  if (client) return client;

  const apiKey = process.env['FIRECRAWL_API_KEY'];
  if (!apiKey) {
    console.error(`Error: FIRECRAWL_API_KEY environment variable is not set.

To get an API key:
1. Sign up at https://firecrawl.dev
2. Copy your API key from the dashboard
3. Set the environment variable:
   export FIRECRAWL_API_KEY=your_key_here`);
    process.exit(2);
  }

  client = new Firecrawl({ apiKey });
  return client;
}
