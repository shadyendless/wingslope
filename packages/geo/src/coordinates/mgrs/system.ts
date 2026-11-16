import { type Compass, type Format, SYMBOL_PATTERNS } from '../latlon/internal'
import { parseMGRS } from './parser'
import { formatMgrsParts, toMgrsParts } from './parts'
import type { CoordinateSystem } from '../latlon/internal/coordinate-system'

/**
 * Military Grid Reference System (MGRS) coordinate system implementation.
 *
 * Provides parsing, conversion, and formatting for MGRS coordinates. MGRS is a geocoordinate
 * standard used by NATO militaries for locating points on Earth, based on the UTM coordinate
 * system. Format: Grid Zone Designation + 100km Square ID + Numerical Location (e.g., '31U BF 12345 67890').
 *
 * @property name - Human-readable name: 'Military Grid Reference System'.
 * @property parse - Parses MGRS coordinate strings into latitude/longitude values.
 * @property toFloat - Converts coordinate component with bearing to signed float value.
 * @property toFormat - Formats latitude/longitude pair back to MGRS coordinate string.
 *
 * @example
 * ```typescript
 * systemMGRS.parse(null, '31U BF 12345 67890');
 * // [[['48.123456', 'N'], ['11.234567', 'E']], []]
 * ```
 *
 * @example
 * ```typescript
 * systemMGRS.toFormat('LATLON', [48.123456, 11.234567]);
 * // '31U BF 12345 67890'
 * ```
 *
 * @example
 * ```typescript
 * systemMGRS.toFloat(['48.123456', 'N']);
 * // 48.123456
 * ```
 */
export const systemMGRS: CoordinateSystem = {
  name: 'Military Grid Reference System',

  parse: parseMGRS,

  toFloat(arg) {
    const [num, bear] = arg as [string, Compass]

    return Number.parseFloat(num) * (SYMBOL_PATTERNS.NEGATIVE_BEARINGS.test(bear) ? -1 : 1)
  },

  toFormat(format: Format, [left, right]: [number, number]) {
    const { LAT, LON } = Object.fromEntries([
      [format.slice(0, 3), left],
      [format.slice(3), right],
    ]) as Record<'LAT' | 'LON', number>

    const result = toMgrsParts([LAT, LON])

    if (!result.ok) {
      // The legacy `toFormat` contract throws for coordinates the grid cannot
      // represent; the parts API returns `{ ok: false }` for the same inputs.
      throw new RangeError(
        `Coordinate [${LAT}, ${LON}] cannot be represented in MGRS (outside 80°S–84°N, on the +180° antimeridian, or not finite).`,
      )
    }

    return formatMgrsParts(result.value)
  },
}
