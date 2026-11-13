export interface GsHeroProps {
  /**
   * Compact layout: the icon sits beside the title instead of above it, without the filled
   * background.
   */
  compact?: boolean
  /** Extra classes for the parts the hero styles. Classes on the component go on the root. */
  classes?: { icon?: string; title?: string; subtitle?: string }
}

export interface GsHeroTitleProps {
  /** Heading level. @default 2 */
  level?: 1 | 2 | 3 | 4 | 5 | 6
}
