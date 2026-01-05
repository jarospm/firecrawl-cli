#!/usr/bin/env tsx
/**
 * Smoke tests for firecrawl-cli
 *
 * Runs each command once with minimal parameters to verify end-to-end functionality.
 * Uses real API calls - run sparingly to conserve credits.
 *
 * Usage:
 *   npm run test:smoke                 # Run all tests (5 commands)
 *   npm run test:smoke -- --dry        # Show commands without running
 *   npm run test:smoke -- --skip-crawl # Skip crawl (slow due to queue)
 *   npm run test:smoke -- --fast       # Skip crawl and agent
 *   npm run test:smoke -- --core       # Only scrape and agent
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '..', 'src', 'cli.ts');

const TEST_URL = 'https://example.com';

interface TestCase {
  name: string;
  args: string[];
  tags?: ('crawl' | 'agent' | 'secondary')[]; // For selective skipping
  validate?: (stdout: string) => boolean;
}

const tests: TestCase[] = [
  {
    name: 'scrape',
    args: ['scrape', TEST_URL, '--quiet'],
    validate: (out) => out.includes('Example Domain'),
  },
  {
    name: 'search',
    args: ['search', 'example domain IANA', '--limit', '1', '--quiet'],
    tags: ['secondary'],
    validate: (out) => out.length > 0,
  },
  {
    name: 'map',
    args: ['map', TEST_URL, '--limit', '5', '--quiet'],
    tags: ['secondary'],
    validate: (out) => out.includes('example.com'),
  },
  {
    name: 'crawl',
    args: ['crawl', TEST_URL, '--limit', '1', '--depth', '1', '--quiet'],
    tags: ['crawl'],
    validate: (out) => out.includes('Example Domain'),
  },
  {
    name: 'agent',
    args: [
      'agent',
      'What is the title of this page? Reply with just the title.',
      '--url',
      TEST_URL,
      '--quiet',
    ],
    tags: ['agent'],
    validate: (out) => out.length > 0,
  },
];

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  skipped?: boolean;
}

async function runTest(test: TestCase): Promise<TestResult> {
  const start = Date.now();

  return new Promise((resolve) => {
    const proc = spawn('tsx', [CLI, ...test.args], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      const duration = Date.now() - start;

      if (code !== 0) {
        resolve({
          name: test.name,
          passed: false,
          duration,
          error: `Exit code ${code}: ${stderr.trim() || 'No error message'}`,
        });
        return;
      }

      if (test.validate && !test.validate(stdout)) {
        resolve({
          name: test.name,
          passed: false,
          duration,
          error: `Validation failed. Output: ${stdout.slice(0, 200)}...`,
        });
        return;
      }

      resolve({ name: test.name, passed: true, duration });
    });

    proc.on('error', (err) => {
      resolve({
        name: test.name,
        passed: false,
        duration: Date.now() - start,
        error: `Failed to spawn: ${err.message}`,
      });
    });
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry') || args.includes('--dry-run');
  const skipCrawl = args.includes('--skip-crawl');
  const fast = args.includes('--fast');
  const core = args.includes('--core');

  // Build skip set based on flags
  const skipTags = new Set<string>();
  if (skipCrawl || fast || core) skipTags.add('crawl');
  if (fast) skipTags.add('agent');
  if (core) skipTags.add('secondary');

  const shouldSkip = (test: TestCase): boolean =>
    test.tags?.some((tag) => skipTags.has(tag)) ?? false;

  console.log('🔥 Firecrawl CLI Smoke Tests\n');

  if (dryRun) {
    console.log('Dry run - commands that would execute:\n');
    for (const test of tests) {
      if (shouldSkip(test)) {
        console.log(`  [skip] ${test.name}`);
      } else {
        console.log(`  tsx ${CLI} ${test.args.join(' ')}`);
      }
    }
    console.log('\nRun without --dry to execute.');
    return;
  }

  const testsToRun = tests.filter((t) => !shouldSkip(t));
  const skippedTests = tests.filter((t) => shouldSkip(t));
  const results: TestResult[] = [];

  for (const test of testsToRun) {
    process.stdout.write(`  ${test.name}...`);
    const result = await runTest(test);
    results.push(result);

    if (result.passed) {
      console.log(` ✓ (${formatDuration(result.duration)})`);
    } else {
      console.log(` ✗`);
      console.log(`    ${result.error}`);
    }
  }

  // Show skipped tests
  for (const test of skippedTests) {
    results.push({ name: test.name, passed: true, duration: 0, skipped: true });
    console.log(`  ${test.name}... ○ skipped`);
  }

  // Summary
  console.log('');
  const failed = results.filter((r) => !r.passed).length;
  const skipped = results.filter((r) => r.skipped).length;
  const total = results.length - skipped;

  if (failed === 0) {
    console.log(`✓ All ${total} tests passed`);
  } else {
    console.log(`✗ ${failed}/${total} tests failed`);
    process.exit(1);
  }
}

main();
