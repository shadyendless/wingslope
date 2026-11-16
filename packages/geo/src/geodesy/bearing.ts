import { toSphericalPoints } from './to-spherical-points'
import type { LonLatTuple } from '../coordinates/latlon/internal/normalize'

/**
 * Computes the initial great-circle bearing from origin to destination.
 *
 * Bearing is expressed as degrees clockwise from true north (0–360).
 * Antipodal points and antimeridian crossings are handled correctly by
 * the underlying geodesy library.
 *
 * @param origin - The starting coordinate as `[longitude, latitude]` in decimal degrees.
 * @param destination - The ending coordinate as `[longitude, latitude]` in decimal degrees.
 * @returns The initial bearing in degrees (0–360), or `0` when origin and destination coincide (within `Number.EPSILON` degrees).
 * @throws {RangeError} When any coordinate component is not a finite number.
 *
 * @remarks
 * pure function
 *
 * Longitude and latitude are not range-checked. Map libraries such as deck.gl
 * hand this function longitudes beyond ±180 when the map wraps, and the
 * spherical math is periodic, so out-of-range values still produce the
 * correct bearing.
 *
 * @example
 * ```typescript
 * bearing([0, 0], [0, 1]);
 * // 0 — due north
 *
 * bearing([0, 0], [1, 0]);
 * // 90 — due east
 *
 * bearing([0, 0], [-1, 0]);
 * // 270 — due west
 * ```
 */
export function bearing(origin: LonLatTuple, destination: LonLatTuple): number {
  const [originPoint, destinationPoint] = toSphericalPoints(origin, destination, 'bearing')

  // The library returns NaN for coincident points (within Number.EPSILON), so
  // short-circuit with its own equality check to keep the result a usable angle.
  if (originPoint.equals(destinationPoint)) {
    return 0
  }

  return originPoint.initialBearingTo(destinationPoint)
}
