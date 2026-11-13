import type { DateValue, Time } from '@internationalized/date'
import type { GsFieldClasses, GsFieldProps } from '../field/types'

/** Extra classes for the parts of a `GsDateField` or `GsTimeField`. */
export interface GsDateFieldClasses extends GsFieldClasses {
  /** The box around the segments (and the calendar icon of a date field). */
  control?: string
  /** The row of segments. */
  input?: string
  /** Each editable segment (day, month, hour, …). */
  segment?: string
}

/** Extra classes for the parts of a `GsTimeField`. */
export type GsTimeFieldClasses = GsDateFieldClasses

export interface GsDateFieldProps extends GsFieldProps {
  /** Smallest editable unit. @default 'day' */
  granularity?: 'day' | 'hour' | 'minute' | 'second'
  /** 12 or 24 hour clock when the granularity includes time. Defaults to the locale's. */
  hourCycle?: 12 | 24
  /** Earliest allowed date. */
  minValue?: DateValue
  /** Latest allowed date. */
  maxValue?: DateValue
  /** Shows the month as an abbreviated name (e.g. "Jan") instead of a number. @default true */
  shortMonth?: boolean
  /** BCP 47 locale for segment order and names. Defaults to Reka UI's `ConfigProvider` locale. */
  locale?: string
  readonly?: boolean
  /**
   * Extra classes for inner parts: `label`, `control`, `input`, `segment`, `description` and
   * `error`. Classes on the component itself go on the field wrapper.
   */
  classes?: GsDateFieldClasses
}

export interface GsTimeFieldProps extends GsFieldProps {
  /** Smallest editable unit. @default 'second' */
  granularity?: 'hour' | 'minute' | 'second'
  /** 12 or 24 hour clock. @default 24 */
  hourCycle?: 12 | 24
  minValue?: Time
  maxValue?: Time
  /** BCP 47 locale. Defaults to Reka UI's `ConfigProvider` locale. */
  locale?: string
  readonly?: boolean
  /**
   * Extra classes for inner parts: `label`, `control`, `input`, `segment`, `description` and
   * `error`. Classes on the component itself go on the field wrapper.
   */
  classes?: GsTimeFieldClasses
}
