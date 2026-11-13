import type { GsLabelPosition } from '../checkbox/types'

export interface GsSwitchProps {
  disabled?: boolean
  required?: boolean
  /** Name submitted with a form. */
  name?: string
  /** Side of the switch the label sits on. @default 'end' */
  labelPosition?: GsLabelPosition
  /**
   * Extra classes for inner parts: `control` (the track and handle) and `label` (the label text).
   * Classes on the component itself go on the root button.
   */
  classes?: { control?: string; label?: string }
}

/** Props `provideSwitchDefaults()` can set for every `GsSwitch` below it. */
export type GsSwitchDefaults = Pick<GsSwitchProps, 'labelPosition' | 'disabled' | 'classes'>
