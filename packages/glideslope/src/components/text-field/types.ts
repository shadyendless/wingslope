import type { GsFieldProps } from '../field/types'
import type { GsInputProps } from '../input/types'

export interface GsTextFieldProps
  extends
    GsFieldProps,
    Pick<GsInputProps, 'type' | 'placeholder' | 'readonly' | 'clearable' | 'autoSize'> {
  /** Minimum number of characters. Checked by the field's validation once the user has typed. */
  minLength?: number
  /** Maximum number of characters. The input stops accepting text beyond it. */
  maxLength?: number
  /**
   * Extra classes for inner parts: `label`, `description` and `error`, and `input`, which takes
   * `GsInput`'s parts plus `container` (the input's outer box). Classes on the component itself go
   * on the field wrapper.
   */
  classes?: {
    label?: string
    input?: GsInputProps['classes'] & { container?: string }
    description?: string
    error?: string
  }
}

/** Props `provideTextFieldDefaults()` can set for every `GsTextField` below it. */
export type GsTextFieldDefaults = Pick<
  GsTextFieldProps,
  | 'size'
  | 'disabled'
  | 'required'
  | 'readonly'
  | 'clearable'
  | 'autoSize'
  | 'validationMode'
  | 'classes'
>

export interface GsTextAreaFieldProps extends GsFieldProps {
  placeholder?: string
  readonly?: boolean
  /** Visible text lines. */
  rows?: number
  /** Minimum number of characters. Checked by the field's validation once the user has typed. */
  minLength?: number
  /** Maximum number of characters. The textarea stops accepting text beyond it. */
  maxLength?: number
  /**
   * Extra classes for inner parts: `label`, `input` (the `<textarea>`), `description` and
   * `error`. Classes on the component itself go on the field wrapper.
   */
  classes?: { label?: string; input?: string; description?: string; error?: string }
}

/** Props `provideTextAreaFieldDefaults()` can set for every `GsTextAreaField` below it. */
export type GsTextAreaFieldDefaults = Pick<
  GsTextAreaFieldProps,
  'size' | 'disabled' | 'required' | 'readonly' | 'validationMode' | 'classes'
>

export interface GsSearchFieldProps {
  /** @default 'outline' */
  variant?: 'filled' | 'outline'
  placeholder?: string
  disabled?: boolean
  /** Replaces the clear button with a spinner while results load. */
  loading?: boolean
  /**
   * Extra classes for inner parts: `input` (the `<input>`), `clear` (the clear button), `loading`
   * (the spinner) and `search` (the search icon). Classes on the component itself go on the
   * wrapper.
   */
  classes?: { input?: string; clear?: string; loading?: string; search?: string }
}

/** Props `provideSearchFieldDefaults()` can set for every `GsSearchField` below it. */
export type GsSearchFieldDefaults = Pick<GsSearchFieldProps, 'variant' | 'disabled' | 'classes'>
