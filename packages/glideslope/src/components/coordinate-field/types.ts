import type { GsFieldClasses, GsFieldProps } from '../field/types'

/** Coordinate systems a `GsCoordinateField` can display and accept. */
export type GsCoordinateSystem = 'dd' | 'ddm' | 'dms' | 'mgrs' | 'utm'

/**
 * A coordinate in decimal degrees: the field's value whatever `format` it displays. Every
 * `v-model` value and `update:modelValue` payload has this shape.
 */
export interface GsCoordinateValue {
  /** Latitude in decimal degrees, -90 to 90. */
  lat: number
  /** Longitude in decimal degrees, -180 to 180. */
  lon: number
}

/** Kinds of segment in a coordinate input. */
export type GsCoordinateSegmentType = 'numeric' | 'directional' | 'literal' | 'alphanumeric'

/** One part of a coordinate input: an editable segment or a literal separator. */
export interface GsCoordinateSegmentConfig {
  type: GsCoordinateSegmentType
  /** Placeholder text shown while the segment is empty. */
  placeholder?: string
  /** Maximum number of characters. */
  maxLength?: number
  /** Character class of allowed characters, e.g. `[0-9\\-\\.]` or `[NS]`. */
  allowedChars?: string
  /** Fixed text of a literal separator (e.g. `", "` or `"°"`). */
  value?: string
  /** Extra width in `ch` added to the segment's text width. @default 0.5 */
  pad?: number
}

/** @internal Props of the internal `GsCoordinateSegment`. */
export interface GsCoordinateSegmentProps {
  /** The segment's text. */
  value: string
  /** Accessible name, e.g. "Latitude degrees". */
  label: string
  /** Position among the field's editable segments. */
  segmentIndex: number
  placeholder?: string
  maxLength?: number
  /** Character class of allowed characters, matched case-insensitively. */
  allowedChars?: string
  /** Extra width in `ch`. @default 0.5 */
  pad?: number
  disabled?: boolean
  readonly?: boolean
  required?: boolean
}

/** A pasted coordinate string that one coordinate system's parser accepted. */
export interface GsParsedCoordinateMatch {
  /** The coordinate system that parsed the text. */
  format: GsCoordinateSystem
  /** The parsed coordinate in decimal degrees. */
  value: GsCoordinateValue
  /** The coordinate rendered in the matched system. */
  displayString: string
}

/** A coordinate rendered in one coordinate system, for the format popover. */
export interface GsCoordinateFormatResult {
  /** The formatted coordinate, or an error message when it can't be rendered. */
  value: string
  /** Whether `value` is a usable coordinate that can be copied. */
  isValid: boolean
}

/** Layout of the segments: one row, or latitude and longitude on separate rows. */
export type GsCoordinateFieldVariant = 'inline' | 'stacked'

/** Extra classes for the parts of a `GsCoordinateField`. */
export interface GsCoordinateFieldClasses extends GsFieldClasses {
  /** The outlined box around the segments and the format button. */
  control?: string
  /** The container of the segments. */
  input?: string
  /** Each editable segment (`<input>`). */
  segment?: string
  /** The button that opens the format popover. */
  formatButton?: string
}

export interface GsCoordinateFieldProps extends GsFieldProps {
  /**
   * Coordinate system the segments display and accept. Changing it converts the current value.
   * @default 'dd'
   */
  format?: GsCoordinateSystem
  /** `inline` shows every segment on one row; `stacked` puts longitude on a second row. @default 'inline' */
  variant?: GsCoordinateFieldVariant
  /** Show the button that opens a popover with the value in every format, ready to copy. @default true */
  showFormatButton?: boolean
  /** Tooltip of the format button. @default 'View/copy other formats' */
  formatButtonTooltip?: string
  /** Show the value without letting it be edited. */
  readonly?: boolean
  /** Value to start with when the field has no `v-model`. */
  defaultValue?: GsCoordinateValue
  /**
   * Extra classes for inner parts: `label`, `control`, `input`, `segment`, `formatButton`,
   * `description` and `error`. Classes on the component itself go on the field wrapper.
   */
  classes?: GsCoordinateFieldClasses
}

/** Props `provideCoordinateFieldDefaults()` can set for every `GsCoordinateField` below it. */
export type GsCoordinateFieldDefaults = Pick<
  GsCoordinateFieldProps,
  | 'format'
  | 'size'
  | 'variant'
  | 'showFormatButton'
  | 'formatButtonTooltip'
  | 'disabled'
  | 'required'
  | 'readonly'
  | 'validationMode'
  | 'classes'
>

/**
 * Context of an `error` event. Validation errors carry the geo parser's `errors`, the `format`
 * and the `segments`; paste errors carry the `pastedText`.
 */
export type GsCoordinateErrorContext = Record<string, unknown>
