import type { GsFieldClasses, GsFieldProps } from '../field/types'

/** Extra classes for the parts of a `GsSelectField`. */
export interface GsSelectFieldClasses extends GsFieldClasses {
  /** The trigger button (also the plain-text trigger when `readonly`). */
  trigger?: string
  /** The selected option's label, or the placeholder, inside the trigger. */
  value?: string
  /** The dropdown list. */
  popover?: string
}

export interface GsSelectFieldProps extends GsFieldProps {
  /** Shown in the trigger while nothing is selected. */
  placeholder?: string
  /** Shows the selected value as plain text, without the trigger. */
  readonly?: boolean
  /** Allow several selections; the model becomes an array. */
  multiple?: boolean
  /**
   * Extra classes for inner parts: `label`, `trigger`, `value`, `popover`, `description` and
   * `error`. Classes on the component itself go on the field wrapper.
   */
  classes?: GsSelectFieldClasses
}

/** Defaults a parent component can provide to every `GsSelectField` below it. */
export type GsSelectFieldDefaults = Pick<GsSelectFieldProps, 'size' | 'disabled' | 'readonly'>

/** Extra classes for the parts of a `GsComboBoxField`. */
export interface GsComboBoxFieldClasses extends GsFieldClasses {
  /** The box around the input and its buttons. */
  control?: string
  /** The `<input>`. */
  input?: string
  /** The clear button. */
  clear?: string
  /** The button that opens the list. */
  trigger?: string
  /** The dropdown list. */
  popover?: string
}

export interface GsComboBoxFieldProps extends GsFieldProps {
  placeholder?: string
  /** Shows the value as plain text that can't be edited, without the clear and list buttons. */
  readonly?: boolean
  /**
   * Shows a clear button while the input has focus and text. Clearing also clears the selection.
   * Never shown when `readonly`. @default true
   */
  clearable?: boolean
  /**
   * Keeps typed text that doesn't match an option: when focus leaves the input (or on Enter with
   * no option highlighted), `v-model` becomes the typed string. Typing an option's label (ignoring
   * case) selects that option, and an empty input clears the value to `null`.
   */
  allowCustomValue?: boolean
  /**
   * Turns off the built-in filtering, so every option in the default slot is shown. Filter the
   * options yourself from `v-model:search`, e.g. for server-side search.
   */
  ignoreFilter?: boolean
  /**
   * Extra classes for inner parts: `label`, `control`, `input`, `clear`, `trigger`, `popover`,
   * `description` and `error`. Classes on the component itself go on the field wrapper.
   */
  classes?: GsComboBoxFieldClasses
}

/** Defaults a parent component can provide to every `GsComboBoxField` below it. */
export type GsComboBoxFieldDefaults = Pick<
  GsComboBoxFieldProps,
  'size' | 'disabled' | 'readonly' | 'clearable'
>
