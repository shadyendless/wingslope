/**
 * Return an error string if the value is outside the range where the limits
 * are 0-limit.
 *
 * @param label - Descriptive label for the value being validated (e.g., "Minutes", "Seconds").
 * @param value - String representation of the numeric value to validate.
 * @param limit - Maximum allowed value (minimum is always 0).
 * @returns Error message string if out of range, undefined if valid.
 *
 * @example
 * ```typescript
 * inRange('Minutes', '45', 59);
 * // undefined (valid)
 * ```
 *
 * @example
 * ```typescript
 * inRange('Minutes', '61', 59);
 * // 'Minutes value (61) exceeds max value (59).'
 * ```
 *
 * @example
 * ```typescript
 * inRange('Seconds', '-5', 59);
 * // 'Seconds value (-5) must be positive.'
 * ```
 */
export const inRange = (label: string, value: string, limit: number) => {
  const num = Number.parseFloat(value)

  if (value !== '' && Number.isNaN(num)) {
    return `${label} value (${value}) is not a valid number.`
  }

  if (limit < num) {
    return `${label} value (${value}) exceeds max value (${limit}).`
  }

  if (num < 0) {
    return `${label} value (${value}) must be positive.`
  }
}
