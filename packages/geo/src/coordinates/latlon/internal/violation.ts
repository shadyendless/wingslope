/**
 * Formats an error message with a standard [ERROR] prefix.
 *
 * @param s - The error message string to format.
 * @returns Formatted error string with [ERROR] prefix.
 *
 * @example
 * ```typescript
 * violation('Invalid coordinate value.');
 * // '[ERROR] Invalid coordinate value.'
 * ```
 *
 * @example
 * ```typescript
 * violation('Degrees value (91) exceeds max value (90).');
 * // '[ERROR] Degrees value (91) exceeds max value (90).'
 * ```
 */
export const violation = (s: string) => `[ERROR] ${s}`
