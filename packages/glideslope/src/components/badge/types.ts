export type GsBadgeColor = 'info' | 'advisory' | 'normal' | 'serious' | 'critical'

/** Side (or corner) of the positioned parent that the badge is pinned to. */
export type GsBadgePlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | `${'top' | 'bottom'} ${'left' | 'right'}`

/** Offset in pixels from the placement edge, for both axes or per axis. */
export type GsBadgeOffset = number | { x?: number; y?: number }

export interface GsBadgeProps {
  /** Semantic color. @default 'info' */
  color?: GsBadgeColor
  /**
   * Pins the badge to an edge or corner of its nearest positioned ancestor. When omitted the badge
   * renders inline.
   */
  placement?: GsBadgePlacement
  /** Distance from the placement edge, in pixels. */
  offset?: GsBadgeOffset
}

export type GsBadgeDefaults = GsBadgeProps
