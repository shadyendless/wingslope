import { HOURS_MAPPING, MINUTES_MAPPING, MS_PER_HOUR } from '../constants'
import { wrap } from './wrap'

const MS_PER_SECOND = 1000
const MS_PER_DAY = MS_PER_HOUR * 24

const hoursIntervals = Object.values(HOURS_MAPPING)
const minutesIntervals = Object.values(MINUTES_MAPPING)

/**
 * Rounds a millisecond timestamp down to the nearest interval boundary.
 * Uses pure integer arithmetic to avoid Date object allocations.
 *
 * @throws {RangeError} If selectedTimeIntervalMs does not match a known interval.
 */
export function roundMsToInterval(timestampMs: number, selectedTimeIntervalMs: number): number {
  // Zero out sub-second precision (wrap handles negative timestamps correctly)
  const msRemainder = wrap(0, MS_PER_SECOND, timestampMs)
  const secondAligned = timestampMs - msRemainder

  if (minutesIntervals.includes(selectedTimeIntervalMs)) {
    const intervalRemainder = wrap(0, selectedTimeIntervalMs, secondAligned)
    return secondAligned - intervalRemainder
  }

  if (hoursIntervals.includes(selectedTimeIntervalMs)) {
    // Hours interval — align to interval boundary within the day
    const msIntoDay = wrap(0, MS_PER_DAY, secondAligned)
    const hourAligned = msIntoDay - (msIntoDay % selectedTimeIntervalMs)
    return secondAligned - msIntoDay + hourAligned
  }

  throw new RangeError(`Unrecognized time interval: ${selectedTimeIntervalMs}ms`)
}
