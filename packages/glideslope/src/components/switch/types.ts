import type { GsLabelPosition } from '../checkbox/types'

export interface GsSwitchProps {
  disabled?: boolean
  required?: boolean
  /** Name submitted with a form. */
  name?: string
  /** Side of the switch the label sits on. @default 'end' */
  labelPosition?: GsLabelPosition
}
