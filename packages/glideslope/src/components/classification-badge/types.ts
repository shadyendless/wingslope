import type { GsClassificationVariant } from '../classification-banner/types'

export type GsClassificationBadgeSize = 'medium' | 'small'

export interface GsClassificationBadgeProps {
  /** Classification level to display. @default 'missing' */
  variant?: GsClassificationVariant
  /** Size of the badge. @default 'medium' */
  size?: GsClassificationBadgeSize
}

/** Props `provideClassificationBadgeDefaults()` can set for every badge below it. */
export type GsClassificationBadgeDefaults = GsClassificationBadgeProps
