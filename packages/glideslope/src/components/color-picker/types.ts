import type { GsColorFormat, GsColorInput } from './colors'

/** Extra classes for the parts of a `GsColorPicker`. */
export interface GsColorPickerClasses {
  /** The visible label. */
  label?: string
  /** The list of swatches. */
  picker?: string
  /** Each swatch option, which carries the focus and selection outline. */
  item?: string
  /** The color square inside each swatch option. */
  swatch?: string
}

export interface GsColorPickerProps {
  /** Swatch colors: CSS color strings, RGBA tuples (0–255) or Reka UI `Color` objects. */
  items: GsColorInput[]
  /** Visible label for the group. Without one, give the picker an `aria-label`. */
  label?: string
  required?: boolean
  disabled?: boolean
  /** Adds a leading "no color" button; choosing it sets the model to `undefined`. */
  allowEmpty?: boolean
  /** Adds a trailing button that opens a full picker (area, hue slider and RGB fields). */
  showCustomPicker?: boolean
  /**
   * The format `v-model` is updated with: a hex string, an RGBA tuple (0–255) or a Reka UI
   * `Color`. Defaults to the format of the bound value (hex for any color string), or hex while
   * nothing has been bound.
   */
  format?: GsColorFormat
  /**
   * Extra classes for inner parts: `label`, `picker`, `item` and `swatch`. Classes on the
   * component itself go on the outer container.
   */
  classes?: GsColorPickerClasses
}

export interface GsCustomColorPickerProps {
  /**
   * Makes the button a toggle (`aria-pressed`) and shows it as selected while `true`, e.g. while
   * the current color came from this picker.
   */
  active?: boolean
  disabled?: boolean
  /**
   * The format `v-model` is updated with: a hex string, an RGBA tuple (0–255) or a Reka UI
   * `Color`. Defaults to the format of the bound value (hex for any color string).
   */
  format?: GsColorFormat
}

export interface GsNoColorButtonProps {
  /**
   * Makes the button a toggle (`aria-pressed`) and shows it as selected while `true`, e.g. while
   * no color is chosen.
   */
  active?: boolean
  disabled?: boolean
}
