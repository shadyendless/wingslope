export type GsIconSize = 'large' | 'medium' | 'small' | 'xsmall'

export interface GsIconProps {
  /**
   * Icon size. When omitted, the size comes from the nearest parent that provides icon defaults
   * (for example `GsButton`), falling back to `medium`.
   */
  size?: GsIconSize
}

/** Defaults a parent component can provide to every `GsIcon` below it. */
export interface GsIconDefaults {
  size?: GsIconSize
  /** Extra class applied to each icon, for parents that position or color their icons. */
  class?: string
}
