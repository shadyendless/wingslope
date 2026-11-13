import type { AcceptableValue } from 'reka-ui'
import type { GsLabelPosition } from '../checkbox/types'

export interface GsRadioProps {
  /** Value selected in the group's model when this radio is chosen. */
  value: AcceptableValue
  disabled?: boolean
  /** Side of the circle the label sits on. @default 'end' */
  labelPosition?: GsLabelPosition
  /**
   * Extra classes for inner parts: `control` (the circle) and `label` (the label text). Classes on
   * the component itself go on the root button.
   */
  classes?: { control?: string; label?: string }
}

export interface GsRadioGroupProps {
  /** Visible group label. Without one, give the group an `aria-label`. */
  label?: string
  disabled?: boolean
  required?: boolean
  /** Name submitted with a form. */
  name?: string
  /** Also sets which arrow keys move between radios. @default 'vertical' */
  orientation?: 'horizontal' | 'vertical'
  /** Label position for every radio in the group. */
  labelPosition?: GsLabelPosition
  /** Extra classes for the group `label`. Classes on the component itself go on the group. */
  classes?: { label?: string }
}
