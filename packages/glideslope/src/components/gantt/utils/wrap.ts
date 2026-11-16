/**
 * Wraps a number into the half-open range `[min, max)`, cycling values that fall outside it back
 * around rather than clamping them to the edge. A local copy of `@accelint/math`'s `wrap`.
 *
 * Unlike clamping, this treats the range as circular: a value past `max` re-enters at `min`, and
 * one below `min` re-enters just under `max`. It handles negative and multi-revolution inputs
 * (JavaScript's `%` keeps the dividend's sign, so a raw modulo would leave `-90` negative).
 *
 * @param min - The inclusive lower bound.
 * @param max - The exclusive upper bound.
 * @param value - The value to wrap.
 * @returns The wrapped value, in `[min, max)`.
 * @throws {RangeError} If `min >= max`.
 *
 * @example
 * ```ts
 * wrap(0, 360, 370) // 10
 * wrap(0, 360, -90) // 270
 * wrap(-180, 180, 190) // -170
 * wrap(0, 1000, -1) // 999
 * ```
 */
export function wrap(min: number, max: number, value: number): number {
  if (min >= max) {
    throw new RangeError('min must be less than max')
  }

  const range = max - min

  return ((((value - min) % range) + range) % range) + min
}
