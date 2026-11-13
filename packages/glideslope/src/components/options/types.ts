import type { AcceptableValue } from 'reka-ui'

export interface GsOptionsProps {
  /** Allow selecting several options; the model becomes an array. */
  multiple?: boolean
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
}

export interface GsOptionSectionProps {
  /** Heading shown above the section's options. */
  header: string
}
