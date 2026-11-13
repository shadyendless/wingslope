import type { DateValue, Time } from '@internationalized/date'
import type { GsFieldProps } from '../field/types'

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
}

export interface GsTimeFieldProps extends GsFieldProps {
  /** Smallest editable unit. @default 'minute' */
  granularity?: 'hour' | 'minute' | 'second'
  /** 12 or 24 hour clock. Defaults to the locale's. */
  hourCycle?: 12 | 24
  minValue?: Time
  maxValue?: Time
  /** BCP 47 locale. Defaults to Reka UI's `ConfigProvider` locale. */
  locale?: string
  readonly?: boolean
}
