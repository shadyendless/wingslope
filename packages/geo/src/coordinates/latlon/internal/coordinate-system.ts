import type { Compass, Format } from '.'
import type { ParseResults } from './parse'

// NOTE: isolated CoordinateSystem type so that it could be a private-export

/**
 * Coordinate system interface for parsing, converting, and formatting geographic coordinates.
 *
 * Defines the contract for coordinate notation systems (Decimal Degrees, Degrees Decimal Minutes,
 * Degrees Minutes Seconds) to parse, convert to float, and format coordinate values.
 *
 * @property name - Human-readable name of the coordinate system.
 * @property parse - Parses a coordinate string into validated tokens or error messages.
 * @property toFloat - Converts parsed coordinate components (degrees, minutes, seconds, bearing) to a float.
 * @property toFormat - Formats numeric coordinate pair back to string representation.
 *
 * @example
 * ```typescript
 * const system: CoordinateSystem = {
 *   name: 'Decimal Degrees',
 *   parse: (format, input) => parseDecimalDegrees(input, format),
 *   toFloat: ([deg, bear]) => Number.parseFloat(deg) * (bear === 'S' || bear === 'W' ? -1 : 1),
 *   toFormat: (format, [lat, lon]) => `${Math.abs(lat)}° ${lat >= 0 ? 'N' : 'S'} / ${Math.abs(lon)}° ${lon >= 0 ? 'E' : 'W'}`
 * };
 * ```
 */
export type CoordinateSystem = {
  name: string
  parse: (format: Format, input: string) => ParseResults
  toFloat: (a: [string, ...string[], Compass]) => number
  toFormat: (f: Format, a: [number, number]) => string
}
