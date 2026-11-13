import { DateFormatter, getLocalTimeZone, type DateValue } from '@internationalized/date'

export interface Segment {
  part: string
  value: string
}

/**
 * Reka UI shows unset segments as lowercase placeholder tokens (`mm`, `dd`, `yyyy`, `––`).
 * Real values are digits, or capitalized names such as `AM` and `Jan`.
 */
export function isPlaceholderSegment(segment: Segment): boolean {
  return /^[a-z–-]+$/.test(segment.value.trim())
}

/** Only time separators carry meaning; other literals (`/`, `-`, `.`) are replaced by spacing. */
export function isVisibleLiteral(segment: Segment): boolean {
  return segment.part === 'literal' && segment.value.trim() === ':'
}

export function shortMonthName(value: DateValue, locale: string): string {
  return new DateFormatter(locale, { month: 'short' }).format(value.toDate(getLocalTimeZone()))
}
