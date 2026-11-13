import type { AcceptableValue } from 'reka-ui'
import type { GsLabelPosition } from '../checkbox/types'

export interface GsRadioProps {
  /** Value selected in the group's model when this radio is chosen. */
  value: AcceptableValue
  disabled?: boolean
  /** Side of the circle the label sits on. @default 'end' */
  labelPosition?: GsLabelPosition
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
}
