import { type Compass, type Format, SYMBOL_PATTERNS } from '../internal'
import { formatCoordinateSystem } from '../internal/format'
import { toPlainDecimalString } from '../internal/plain-decimal'
import { parseDecimalDegrees } from './parser'
import type { CoordinateSystem } from '../internal/coordinate-system'

/**
 * Decimal Degrees coordinate system implementation.
 *
 * Provides parsing, conversion, and formatting for coordinates in decimal degrees notation.
 * Coordinates are expressed as decimal numbers with degree symbols (e.g., 37.7749° N).
 *
 * @property name - Human-readable name of the coordinate system.
 * @property parse - Parses decimal degrees coordinate strings.
 * @property toFloat - Converts parsed coordinate components to floating point numbers.
 * @property toFormat - Formats numeric coordinates back to decimal degrees string.
 *
 * @example
 * ```ts
 * // Parse a coordinate string
 * const [coords, errors] = systemDecimalDegrees.parse('37.7749° N / 122.4194° W', 'LATLON');
 * ```
 *
 * @example
 * ```ts
 * // Convert to float
 * const lat = systemDecimalDegrees.toFloat(['37.7749', 'N']);
 * // 37.7749
 * ```
 *
 * @example
 * ```ts
 * // Format to string
 * const formatted = systemDecimalDegrees.toFormat('LATLON', [37.7749, -122.4194]);
 * // '37.7749 N / 122.4194 W'
 * ```
 */
export const systemDecimalDegrees: CoordinateSystem = {
  name: 'Decimal Degrees',

  parse: parseDecimalDegrees,

  toFloat(arg) {
    const [num, bear] = arg as [string, Compass]

    return Number.parseFloat(num) * (SYMBOL_PATTERNS.NEGATIVE_BEARINGS.test(bear) ? -1 : 1)
  },

  toFormat(format: Format, coordinates: [number, number]) {
    return formatCoordinateSystem(format, coordinates, toPlainDecimalString)
  },
}
