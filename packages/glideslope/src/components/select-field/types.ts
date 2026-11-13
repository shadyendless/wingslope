import type { GsFieldProps } from '../field/types'

export interface GsSelectFieldProps extends GsFieldProps {
  /** Shown in the trigger while nothing is selected. */
  placeholder?: string
  /** Shows the selected value as plain text, without the trigger. */
  readonly?: boolean
  /** Allow several selections; the model becomes an array. */
  multiple?: boolean
}

export interface GsComboBoxFieldProps extends GsFieldProps {
  placeholder?: string
  readonly?: boolean
  /** Shows a clear button while the input has text, and clears on Escape. @default true */
  clearable?: boolean
}
