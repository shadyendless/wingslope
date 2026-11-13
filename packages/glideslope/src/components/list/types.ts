import type { AcceptableValue } from 'reka-ui'

export type GsListVariant = 'cozy' | 'compact'

export interface GsListProps {
  /** `single` / `multiple` make rows selectable, bound with `v-model`. @default 'none' */
  selectionMode?: 'none' | 'single' | 'multiple'
  /** Row density. @default 'cozy' */
  variant?: GsListVariant
  disabled?: boolean
}

export interface GsListItemProps {
  /** Identifies the row in the list's selection. */
  value: AcceptableValue
  /** Row title, when the default slot isn't used. */
  label?: string
  /** Text for type-ahead and the row's accessible name when the content isn't plain text. */
  textValue?: string
  disabled?: boolean
  /**
   * Makes the row a link: clicking it or pressing Enter opens `href` (and emits `action`). Only in
   * a list without selection, where rows don't select; ignored while the row is disabled.
   */
  href?: string
  /** Where to open `href`, as on an `<a>` (e.g. `_blank`). */
  target?: string
  /** Relationship of the `href` target, as on an `<a>` (e.g. `noreferrer`). */
  rel?: string
  /**
   * Classes for the row's inner parts (`class` goes on the row):
   * - `icon`: every `GsIcon` in the row's content (not the icons inside buttons)
   */
  classes?: {
    icon?: string
  }
}
