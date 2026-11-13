export interface GsLabelProps {
  /** `id` of the form control this label describes. Not needed inside a Glideslope field. */
  for?: string
  /** Applies disabled styling. Defaults to the surrounding field's state. */
  disabled?: boolean
  /**
   * The associated field is required. When `false`, the label shows "(optional)". Defaults to the
   * surrounding field's state.
   */
  required?: boolean
  /**
   * Inside a field, render a native `<label>`. Set `false` for button controls (like a select
   * trigger), where a native label would forward clicks and `:hover` to the button.
   * @default true
   */
  nativeLabel?: boolean
}
