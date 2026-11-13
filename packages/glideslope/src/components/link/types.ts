import type { PrimitiveProps } from 'reka-ui'

export interface GsLinkProps extends PrimitiveProps {
  /** Link destination. Ignored while disabled. */
  href?: string
  /** Prevents navigation, removes the link from the tab order and applies disabled styling. */
  disabled?: boolean
  /**
   * Tracks and shows the visited state: once the link is clicked (or activated with Enter), or
   * while `visited` is set, it gets a `data-visited` attribute to style. When omitted, it comes
   * from the nearest `provideLinkDefaults()`, falling back to `false`.
   */
  allowsVisited?: boolean
}

/** Defaults a parent component can provide to every `GsLink` below it. */
export interface GsLinkDefaults {
  allowsVisited?: boolean
  /** Extra class on each link, for example visited styles (`data-visited:underline`). */
  class?: string
}
