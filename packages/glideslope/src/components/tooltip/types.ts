export type GsOverlaySide = 'top' | 'right' | 'bottom' | 'left'
export type GsOverlayAlign = 'start' | 'center' | 'end'

export interface GsTooltipProps {
  /** Side of the trigger to show on. Flips automatically when there is no room. @default 'bottom' */
  side?: GsOverlaySide
  /** @default 'center' */
  align?: GsOverlayAlign
  /** Gap between trigger and tooltip, in pixels. @default 5 */
  offset?: number
  /** Hover delay before opening, in milliseconds. @default 250 */
  delay?: number
  /** Never show the tooltip. */
  disabled?: boolean
  /** Element or selector to render the tooltip into. @default 'body' */
  portalTo?: string | HTMLElement
  /** Classes for inner parts. `content`: the tooltip itself (the Design Toolkit's `TooltipBody` class). */
  classes?: { content?: string }
}
