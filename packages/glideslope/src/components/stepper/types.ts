/** Identifies a step; the same value links a `GsStepperStep` to its `GsStepperPanel`. */
export type GsStepValue = string | number

export interface GsStepperProps {
  /** Lays the steps out in a row or a column; arrow keys follow it. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  /** The step shown first when `v-model` isn't bound (or is empty). Defaults to the first step. */
  defaultStep?: GsStepValue
  /**
   * Called before the step changes, with the current and the requested step; return `false` to
   * stay on the current step (e.g. while a form is invalid).
   */
  beforeStepChange?: (from: GsStepValue, to: GsStepValue) => boolean
  /** Steps that can't be selected, in addition to each step's own `disabled`. */
  disabledValues?: GsStepValue[]
}

export interface GsStepperStepProps {
  /** This step's value; the matching `GsStepperPanel` uses the same one. */
  value: GsStepValue
  /** The step can't be selected. */
  disabled?: boolean
}

export interface GsStepperPanelProps {
  /** The value of the step this panel belongs to. */
  value: GsStepValue
}
