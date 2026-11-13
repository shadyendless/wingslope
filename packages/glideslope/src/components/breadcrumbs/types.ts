export interface GsBreadcrumbsProps {
  /** Accessible name of the navigation landmark. @default 'Breadcrumb' */
  label?: string
}

export interface GsBreadcrumbItemProps {
  /** Link destination. */
  href?: string
  /** This item is the current page. */
  current?: boolean
  /** Render the single child (e.g. a `RouterLink`) as the link. */
  asChild?: boolean
  /**
   * Classes for the item's inner parts (`class` goes on the item's `<li>`):
   * - `link`: the link, when the item has `href` or `as-child`
   * - `separator`: the chevron after the item (not rendered on the `current` item)
   */
  classes?: {
    link?: string
    separator?: string
  }
}
