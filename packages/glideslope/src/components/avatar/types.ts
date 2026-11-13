export type GsAvatarSize = 'medium' | 'small'

export interface GsAvatarProps {
  /** Image URL. When missing or failing to load, the fallback is shown. */
  src?: string
  /** Accessible name for the avatar, typically the person's name. */
  alt?: string
  /**
   * Avatar size. When omitted, the size comes from the nearest `provideAvatarDefaults()`, falling
   * back to `medium`.
   */
  size?: GsAvatarSize
  /** Wait this long (ms) before showing the fallback, to avoid a flash while the image loads. */
  fallbackDelay?: number
  /** Extra classes for the inner parts. Classes on the component itself go on the root. */
  classes?: {
    /** The `<img>`. */
    image?: string
    /** The wrapper of the fallback, shown while the image loads or when it fails. */
    fallback?: string
    /** The wrapper of the default slot (badges, initials or icons over the avatar). */
    content?: string
  }
}

/** Defaults a parent component can provide to every `GsAvatar` below it. */
export interface GsAvatarDefaults {
  size?: GsAvatarSize
  /** Extra class on each avatar's root, for parents that style the avatars they contain. */
  class?: string
}
