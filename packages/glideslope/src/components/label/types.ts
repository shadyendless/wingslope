export interface GsLabelProps {
  /** `id` of the form control this label describes. Not needed inside a Glideslope field. */
  for?: string
  /**
   * Applies disabled styling. When omitted, it follows the surrounding field's state, or outside a
   * field the nearest `provideLabelDefaults()`, falling back to `false`.
   */
  disabled?: boolean
  /**
   * The associated field is required. When `false`, the label shows "(optional)". When omitted, it
   * follows the surrounding field's state, or outside a field the nearest `provideLabelDefaults()`,
   * falling back to `false`.
   */
  required?: boolean
  /**
   * Inside a field, render a native `<label>`. Set `false` for button controls (like a select
   * trigger), where a native label would forward clicks and `:hover` to the button.
   * @default true
   */
  nativeLabel?: boolean
}

/**
 * Defaults a parent component can provide to every `GsLabel` below it. They apply only to labels
 * outside a field: inside one, the field's own `required` / `disabled` state wins.
 */
export interface GsLabelDefaults {
  disabled?: boolean
  required?: boolean
}
