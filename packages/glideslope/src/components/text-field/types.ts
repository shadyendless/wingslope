import type { GsFieldProps } from '../field/types'
import type { GsInputProps } from '../input/types'

export interface GsTextFieldProps
  extends
    GsFieldProps,
    Pick<GsInputProps, 'type' | 'placeholder' | 'readonly' | 'clearable' | 'autoSize'> {}

export interface GsTextAreaFieldProps extends GsFieldProps {
  placeholder?: string
  readonly?: boolean
  /** Visible text lines. */
  rows?: number
}

export interface GsSearchFieldProps {
  /** @default 'outline' */
  variant?: 'filled' | 'outline'
  placeholder?: string
  disabled?: boolean
  /** Replaces the clear button with a spinner while results load. */
  loading?: boolean
}
