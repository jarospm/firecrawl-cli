/**
 * Progress reporting utilities.
 * All output goes to stderr to allow stdout piping.
 */

let quiet = false;
let verbose = false;

/**
 * Sets quiet mode - suppresses all progress messages except errors.
 */
export function setQuiet(value: boolean): void {
  quiet = value;
}

/**
 * Sets verbose mode - enables detailed progress information.
 */
export function setVerbose(value: boolean): void {
  verbose = value;
}

/**
 * Outputs a status message to stderr.
 * Suppressed in quiet mode.
 */
export function status(message: string): void {
  if (!quiet) {
    console.error(message);
  }
}

/**
 * Outputs a success message with checkmark to stderr.
 * Used for completion status. Suppressed in quiet mode.
 */
export function success(message: string): void {
  if (!quiet) {
    console.error(`✓ ${message}`);
  }
}

/**
 * Outputs a detailed message to stderr.
 * Only shown in verbose mode.
 */
export function detail(message: string): void {
  if (!quiet && verbose) {
    console.error(message);
  }
}

/**
 * Outputs a warning message to stderr.
 * Suppressed in quiet mode.
 */
export function warn(message: string): void {
  if (!quiet) {
    console.error(`Warning: ${message}`);
  }
}

/**
 * Outputs an error message to stderr.
 * Always shown, never suppressed.
 */
export function error(message: string): void {
  console.error(`Error: ${message}`);
}
