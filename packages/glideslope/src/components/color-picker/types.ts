import type { GsColorInput } from './colors'

export interface GsColorPickerProps {
  /** Swatch colors: CSS color strings or RGBA tuples (0–255). */
  items: GsColorInput[]
  /** Visible label for the group. Without one, give the picker an `aria-label`. */
  label?: string
  required?: boolean
  disabled?: boolean
  /** Adds a "no color" option; choosing it sets the model to `undefined`. */
  allowEmpty?: boolean
  /** Adds a button that opens a full picker (area, hue slider and RGB fields) for any color. */
  showCustomPicker?: boolean
}
