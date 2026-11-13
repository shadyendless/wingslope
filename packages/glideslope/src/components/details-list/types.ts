export type GsDetailsListAlign = 'center' | 'justify' | 'left'

export interface GsDetailsListProps {
  /**
   * How labels and values line up:
   * - `justify`: labels flush left, values flush right
   * - `center`: labels flush right and values flush left, meeting in the middle
   * - `left`: both flush left
   * @default 'justify'
   */
  align?: GsDetailsListAlign
  /** Extra classes applied to every label and value. */
  classes?: { label?: string; value?: string }
}
