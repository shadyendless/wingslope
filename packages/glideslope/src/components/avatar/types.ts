export type GsAvatarSize = 'medium' | 'small'

export interface GsAvatarProps {
  /** Image URL. When missing or failing to load, the fallback is shown. */
  src?: string
  /** Accessible name for the avatar, typically the person's name. */
  alt?: string
  /** @default 'medium' */
  size?: GsAvatarSize
  /** Wait this long (ms) before showing the fallback, to avoid a flash while the image loads. */
  fallbackDelay?: number
  /** Extra classes for the inner parts. Classes on the component itself go on the root. */
  classes?: { image?: string; fallback?: string; content?: string }
}
