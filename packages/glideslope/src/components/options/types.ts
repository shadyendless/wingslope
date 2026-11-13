import type { AcceptableValue } from 'reka-ui'

export interface GsOptionsProps {
  /**
   * `single` / `multiple` make options selectable, bound with `v-model` (an array with
   * `multiple`). With `none`, options are only highlighted and emit `action` when chosen.
   * @default 'single'
   */
  selectionMode?: 'none' | 'single' | 'multiple'
  disabled?: boolean
  /** Row density. */
  size?: 'small' | 'large'
}

export interface GsOptionProps {
  /** The value this option selects. */
  value: AcceptableValue
  /** Text shown when the default slot is empty. Also used for type-ahead and filtering. */
  label?: string
  /** Text used for type-ahead and combobox filtering when the content isn't plain text. */
  textValue?: string
  disabled?: boolean
  /** Semantic color of the highlight and selection. @default 'info' */
  color?: 'info' | 'serious' | 'critical'
  /**
   * Extra classes for inner parts. Classes on the option itself go on the option element.
   */
  classes?: {
    /** Every `GsIcon` in the option. */
    icon?: string
  }
}

export interface GsOptionSectionProps {
  /** Heading shown above the section's options. */
  header: string
  /**
   * Extra classes for inner parts. Classes on the section itself go on the group element.
   */
  classes?: {
    /** The heading. */
    header?: string
  }
}
