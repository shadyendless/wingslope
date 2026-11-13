export type GsDetailsListAlign = 'center' | 'justify' | 'left'

export interface GsDetailsListProps {
  /**
   * How labels and values line up:
   * - `justify`: labels flush left, values flush right
   * - `center`: labels flush right and values flush left, meeting in the middle
   * - `left`: both flush left
   *
   * When omitted, it comes from the nearest `provideDetailsListDefaults()`, falling back to
   * `justify`.
   */
  align?: GsDetailsListAlign
  /**
   * Extra classes for the inner parts. Classes on the component itself go on the `<dl>`. They add to
   * any `classes` from `provideDetailsListDefaults()`.
   */
  classes?: {
    /** Every label (`<dt>`). */
    label?: string
    /** Every value (`<dd>`). */
    value?: string
  }
}

/** Defaults a parent component can provide to every `GsDetailsList` below it. */
export interface GsDetailsListDefaults {
  align?: GsDetailsListAlign
  /** Extra classes for the labels and values, added to the list's own `classes`. */
  classes?: GsDetailsListProps['classes']
  /** Extra class on each list's `<dl>`. */
  class?: string
}
