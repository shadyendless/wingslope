/** Security classification level shown by a classification banner or badge. */
export type GsClassificationVariant =
  | 'missing'
  | 'unclassified'
  | 'cui'
  | 'confidential'
  | 'secret'
  | 'top-secret'
  | 'ts-sci'

export interface GsClassificationBannerProps {
  /** Classification level to display. @default 'missing' */
  variant?: GsClassificationVariant
}

/** Props `provideClassificationBannerDefaults()` can set for every banner below it. */
export type GsClassificationBannerDefaults = GsClassificationBannerProps
