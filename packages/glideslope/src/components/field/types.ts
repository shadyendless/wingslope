import type { FieldRootProps } from 'reka-ui'

export type GsFieldSize = 'medium' | 'small'

/**
 * Props shared by every Glideslope field (text, select, combobox, date, …). Validation is provided
 * by Reka UI's `FieldRoot`, so fields also work inside a Reka `FormRoot`.
 */
export interface GsFieldProps {
  /** Visible label. At `size="small"` it is not rendered and becomes the control's `aria-label`. */
  label?: string
  /** Help text below the control. Hidden at `size="small"` and while the field is invalid. */
  description?: string
  /** Error text. Setting it marks the field invalid. */
  errorMessage?: string
  /** @default 'medium' */
  size?: GsFieldSize
  /** Marks the field invalid, e.g. when validation is managed by another library. */
  invalid?: boolean
  disabled?: boolean
  required?: boolean
  /** Field name, submitted with a form. */
  name?: string
  /** Custom validation; return error message(s) when invalid. See Reka UI `FieldRoot`. */
  validate?: FieldRootProps['validate']
  /** When validation runs. @default 'onSubmit' */
  validationMode?: FieldRootProps['validationMode']
}
