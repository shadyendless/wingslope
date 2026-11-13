import type { AcceptableValue } from 'reka-ui'
import type { GsOverlayAlign, GsOverlaySide } from '../tooltip/types'

export type GsMenuVariant = 'cozy' | 'compact'
export type GsMenuItemColor = 'info' | 'serious' | 'critical'
/** Identifies a `GsMenuItem` in its menu's `action` event. */
export type GsMenuItemValue = string | number

export interface GsMenuProps {
  /** Row density. @default 'cozy' */
  variant?: GsMenuVariant
  /** @default 'bottom' */
  side?: GsOverlaySide
  /** @default 'start' */
  align?: GsOverlayAlign
  /** Gap between trigger and menu, in pixels. @default 4 */
  offset?: number
  /** Classes for inner parts. `popover`: the floating panel that holds the items. */
  classes?: { popover?: string }
}

export interface GsContextMenuProps {
  /** Row density. @default 'cozy' */
  variant?: GsMenuVariant
  /** Let the trigger area keep the browser's own context menu. */
  disabled?: boolean
  /** Classes for inner parts. `popover`: the floating panel that holds the items. */
  classes?: { popover?: string }
}

/**
 * Classes for a menu item's inner parts. `text`: the label rendered from the `label` prop. `icon`:
 * the `GsIcon`s in the default slot. `hotkey`: the `hotkey` text.
 */
export interface GsMenuItemClasses {
  text?: string
  icon?: string
  hotkey?: string
}

interface GsMenuItemBaseProps {
  /** Text shown when the default slot is empty. */
  label?: string
  /** Keyboard shortcut shown at the end of the row, e.g. `⌘K`. Display only. */
  hotkey?: string
  /** Text for type-ahead when the content isn't plain text. */
  textValue?: string
  disabled?: boolean
  /** @default 'info' */
  color?: GsMenuItemColor
  /** Classes for inner parts (see `GsMenuItemClasses`): `text`, `icon` and `hotkey`. */
  classes?: GsMenuItemClasses
}

export interface GsMenuItemProps extends GsMenuItemBaseProps {
  /** Passed to the menu's `action` event when the item is chosen. */
  value?: GsMenuItemValue
}

export type GsMenuCheckboxItemProps = GsMenuItemBaseProps

export interface GsMenuRadioItemProps extends GsMenuItemBaseProps {
  /** Value selected in the radio group's model. */
  value: AcceptableValue
}

export interface GsMenuSectionProps {
  /** Heading shown above the section's items. Use the `title` slot for richer content. */
  title?: string
  /** Classes for inner parts. `header`: the heading. */
  classes?: { header?: string }
}

export interface GsMenuSubmenuProps {
  /** Text of the item that opens the submenu, when the `trigger` slot isn't used. */
  label?: string
  disabled?: boolean
  /** @default 'info' */
  color?: GsMenuItemColor
  /**
   * Classes for inner parts. `text`: the label rendered from the `label` prop. `icon`: the
   * `GsIcon`s in the `trigger` slot. `more`: the chevron that marks the submenu. `popover`: the
   * nested panel.
   */
  classes?: Pick<GsMenuItemClasses, 'text' | 'icon'> & { more?: string; popover?: string }
}
