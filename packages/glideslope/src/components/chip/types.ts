import type { AcceptableValue } from 'reka-ui'

export type GsChipColor = 'info' | 'advisory' | 'normal' | 'serious' | 'critical'
export type GsChipSize = 'medium' | 'small'

export interface GsChipStyleProps {
  /** @default 'info' */
  color?: GsChipColor
  /** @default 'medium' (`small` inside a `GsChipList`) */
  size?: GsChipSize
}

export interface GsChipProps extends GsChipStyleProps {
  /** Identifies the chip inside a `GsChipList`. Required there. */
  value?: AcceptableValue
  /** Accessible text, when the content isn't plain text. */
  textValue?: string
}

export interface GsChipItemProps extends GsChipStyleProps {
  /** Identifies the chip in the list's selection and `remove` events. */
  value: AcceptableValue
  disabled?: boolean
  /** Accessible text, when the content isn't plain text. */
  textValue?: string
}

export interface GsDeletableChipProps extends GsChipItemProps {
  /** Extra classes for the `remove` button. Classes on the component itself go on the chip. */
  classes?: { remove?: string }
}

export interface GsChipListProps extends GsChipStyleProps {
  /** `single` / `multiple` make chips selectable, bound with `v-model`. @default 'none' */
  selectionMode?: 'none' | 'single' | 'multiple'
  /**
   * Keeps at least one chip selected: the last selected chip can't be deselected, and Escape
   * doesn't clear the selection.
   */
  disallowEmptySelection?: boolean
  disabled?: boolean
}
