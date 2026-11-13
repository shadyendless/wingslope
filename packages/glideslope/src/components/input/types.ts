export type GsInputSize = 'medium' | 'small'

export interface GsInputProps {
  /** @default 'medium' */
  size?: GsInputSize
  /** Native input type. @default 'text' */
  type?: 'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url' | 'date' | 'time'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  /** Shows invalid styling. Inside a field this follows the field's validity. */
  invalid?: boolean
  /** Shows a clear button while the input has focus and a value, and clears on Escape. @default true */
  clearable?: boolean
  /** Grows and shrinks the input to fit its value (`text` and `number` types). */
  autoSize?: boolean
  /**
   * Extra classes for inner parts: `sizer` (the wrapper that sizes the input), `input` (the
   * `<input>`), `prefix` and `suffix` (the slot wrappers) and `clear` (the clear button). Classes on
   * the component itself go on the outer container.
   */
  classes?: { sizer?: string; input?: string; prefix?: string; suffix?: string; clear?: string }
}
