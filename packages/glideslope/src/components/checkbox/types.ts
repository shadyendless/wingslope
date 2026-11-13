import type { AcceptableValue } from 'reka-ui'

export type GsLabelPosition = 'start' | 'end'

export interface GsCheckboxProps {
  /** Value this checkbox contributes to a `GsCheckboxGroup` model. */
  value?: AcceptableValue
  disabled?: boolean
  required?: boolean
  /** Name submitted with a form. */
  name?: string
  /** Side of the box the label sits on. @default 'end' */
  labelPosition?: GsLabelPosition
  /**
   * Extra classes for inner parts: `control` (the box) and `label` (the label text). Classes on
   * the component itself go on the root button.
   */
  classes?: { control?: string; label?: string }
}

export interface GsCheckboxGroupProps {
  /** Visible group label. Without one, give the group an `aria-label`. */
  label?: string
  disabled?: boolean
  required?: boolean
  /** Name submitted with a form, once per checked value. */
  name?: string
  /** @default 'vertical' */
  orientation?: 'horizontal' | 'vertical'
  /** Label position for every checkbox in the group. */
  labelPosition?: GsLabelPosition
  /** Extra classes for the group `label`. Classes on the component itself go on the group. */
  classes?: { label?: string }
}
