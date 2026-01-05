/**
 * Shared parsing utilities with built-in validation.
 * Centralizes repetitive parsing logic from commands.
 */

import {
  VALID_FORMATS,
  VALID_SITEMAP_OPTIONS,
  type ScrapeFormat,
  type SitemapOption,
} from './constants.js';

/**
 * Parses a string to a positive integer with validation.
 * @param value - The string value to parse
 * @param name - Parameter name for error messages
 * @returns The parsed positive integer
 * @throws Error if value is not a valid positive integer
 */
export function parsePositiveInt(value: string, name: string): number {
  const num = parseInt(value, 10);
  if (isNaN(num) || num <= 0) {
    throw new Error(`${name} must be a positive integer, got: ${value}`);
  }
  return num;
}

/**
 * Parses a comma-separated string of formats with validation.
 * @param value - Comma-separated format string (e.g., "markdown,html")
 * @returns Array of validated format strings
 * @throws Error if any format is invalid
 */
export function parseFormats(value: string): ScrapeFormat[] {
  const formats = value.split(',').map((f) => f.trim().toLowerCase());

  for (const format of formats) {
    if (!VALID_FORMATS.includes(format as ScrapeFormat)) {
      throw new Error(
        `Invalid format: "${format}". Valid formats: ${VALID_FORMATS.join(', ')}`
      );
    }
  }

  return formats as ScrapeFormat[];
}

/**
 * Parses and validates sitemap option.
 * @param value - The sitemap option string
 * @returns Validated sitemap option
 * @throws Error if option is invalid
 */
export function parseSitemap(value: string): SitemapOption {
  const normalized = value.toLowerCase();
  if (!VALID_SITEMAP_OPTIONS.includes(normalized as SitemapOption)) {
    throw new Error(
      `Invalid sitemap option: "${value}". Valid options: ${VALID_SITEMAP_OPTIONS.join(', ')}`
    );
  }
  return normalized as SitemapOption;
}

/**
 * Parses a comma-separated list of URLs.
 * Filters empty strings and trims whitespace.
 * @param value - Comma-separated URL string
 * @returns Array of URL strings
 */
export function parseUrls(value: string): string[] {
  return value
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
}

/**
 * Parses an optional positive integer with default fallback.
 * @param value - Optional string value
 * @param defaultValue - Default if value is undefined
 * @param name - Parameter name for error messages
 * @returns Parsed integer or default
 */
export function parseOptionalInt(
  value: string | undefined,
  defaultValue: number,
  name: string
): number {
  if (!value) return defaultValue;
  return parsePositiveInt(value, name);
}
