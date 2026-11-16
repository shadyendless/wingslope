import type { GsOverlayAlign, GsOverlaySide } from '../tooltip/types'

export interface GsPopoverProps {
  /** Side of the trigger to open on. Flips automatically when there is no room. @default 'bottom' */
  side?: GsOverlaySide
  /** @default 'center' */
  align?: GsOverlayAlign
  /** Gap between trigger and popover, in pixels. @default 8 */
  offset?: number
  /** Trap focus and block interaction outside while open. @default false */
  modal?: boolean
  /**
   * Accessible name of the panel when it has no `GsPopoverTitle`, in place of the trigger's name.
   * A title takes precedence.
   */
  label?: string
  /**
   * Classes for inner parts. `popover`: the panel (the Design Toolkit's `popover` and `dialog`,
   * which are one element here).
   */
  classes?: { popover?: string }
}
