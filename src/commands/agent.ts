import { command, positional, flag, option, optional, string } from 'cmd-ts';
import { readFile } from 'fs/promises';
import { getClient } from '../lib/firecrawl.js';
import { outputAgent } from '../lib/output.js';
import {
  setQuiet,
  setVerbose,
  status,
  success,
  error,
} from '../lib/progress.js';
import { parseUrls } from '../lib/parse.js';
import { POLL_INTERVAL, TIMEOUTS } from '../lib/constants.js';

export const agent = command({
  name: 'agent',
  description:
    'Use AI-powered browsing to gather data based on a natural language prompt',
  args: {
    prompt: positional({
      type: string,
      displayName: 'prompt',
      description: 'Natural language description of what to find',
    }),
    url: option({
      type: optional(string),
      long: 'url',
      description: 'Starting URL(s) to guide the agent (comma-separated)',
    }),
    schema: option({
      type: optional(string),
      long: 'schema',
      description: 'Path to JSON schema file for structured output',
    }),
    strict: flag({
      long: 'strict',
      description: 'Strictly constrain agent to provided URLs',
    }),
    json: flag({
      long: 'json',
      description: 'Output as JSON',
    }),
    quiet: flag({
      long: 'quiet',
      description: 'Suppress progress and status messages',
    }),
    verbose: flag({
      long: 'verbose',
      description: 'Show detailed progress information',
    }),
  },
  handler: async ({
    prompt,
    url: urlArg,
    schema,
    strict,
    json,
    quiet,
    verbose,
  }) => {
    setQuiet(quiet);
    setVerbose(verbose);

    const truncatedPrompt =
      prompt.length > 50 ? `${prompt.slice(0, 50)}...` : prompt;
    status(`Agent working on: "${truncatedPrompt}"`);

    try {
      const client = getClient();

      // Load schema if provided
      let jsonSchema: Record<string, unknown> | undefined;
      if (schema) {
        try {
          const schemaContent = await readFile(schema, 'utf-8');
          jsonSchema = JSON.parse(schemaContent) as Record<string, unknown>;
        } catch (err) {
          error(
            `Failed to load schema file: ${err instanceof Error ? err.message : String(err)}`
          );
          process.exit(2);
        }
      }

      // Parse URLs using shared utility
      const urls = urlArg ? parseUrls(urlArg) : undefined;

      // Use the SDK's built-in agent() method with automatic polling
      const response = await client.agent({
        prompt,
        urls,
        schema: jsonSchema,
        ...(strict && { strictConstrainToURLs: true }),
        pollInterval: POLL_INTERVAL,
        timeout: TIMEOUTS.AGENT,
      });

      if (!response.success || response.status === 'failed') {
        error(`Agent failed: ${response.error || 'Unknown error'}`);
        process.exit(1);
      }

      success('Agent completed');

      outputAgent(response.data, json);
    } catch (err) {
      error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  },
});
