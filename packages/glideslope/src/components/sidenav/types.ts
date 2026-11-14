import type { AsTag } from 'reka-ui'
import type { Component } from 'vue'

/** A command a `GsSidenavTrigger` can run. */
export type GsSidenavAction = 'close' | 'open' | 'toggle'

/**
 * What a `GsSidenavTrigger` does: `'open:<id>'`, `'close:<id>'` or `'toggle:<id>'`, or a bare
 * sidenav id, which toggles it.
 */
export type GsSidenavTarget = `${GsSidenavAction}:${string}` | (string & {})

export interface GsSidenavProps {
  /**
   * Identifies the sidenav for `useSidenavs()` and `GsSidenavTrigger`. It is also the `<nav>`
   * element's `id`. Unique on the page.
   */
  id: string
  /** Render nothing while closed, instead of the collapsed rail. */
  hiddenWhenClosed?: boolean
}

export interface GsSidenavTriggerProps {
  /** The sidenav to toggle (its id), or a command for it: `'open:<id>'`, `'close:<id>'`. */
  for: GsSidenavTarget
}

export interface GsSidenavHeaderProps {
  /** Classes for inner parts: the `header`, its toggle `button`, and the chevron `icon`. */
  classes?: { header?: string; button?: string; icon?: string }
}

export interface GsSidenavItemProps {
  /** Text of the tooltip shown while the sidenav is collapsed. */
  textValue?: string
  /** Prevents interaction and applies disabled styling. */
  disabled?: boolean
  /** Classes for inner parts: the `button`, and every `GsIcon` in it (`icon`). */
  classes?: { button?: string; icon?: string }
}

export interface GsSidenavLinkProps {
  /** Link destination. Ignored while disabled. */
  href?: string
  /** Text of the tooltip shown while the sidenav is collapsed. */
  textValue: string
  /** Prevents navigation, removes the link from the tab order and applies disabled styling. */
  disabled?: boolean
  /**
   * Element or component to render, such as Vue Router's `RouterLink` (pass its `to` as an
   * attribute). @default 'a'
   */
  as?: AsTag | Component
  /** Classes for inner parts: the link (`button`), and every `GsIcon` in it (`icon`). */
  classes?: { button?: string; icon?: string }
}

export interface GsSidenavMenuProps {
  /** Menu title: the expanded menu's label, and the collapsed menu's tooltip and panel title. */
  title: string
  /** Classes for inner parts. */
  classes?: {
    /** The expanded menu's container. */
    menu?: string
    /** The button that expands the menu or opens its panel. */
    button?: string
    /** The expanded menu's chevron. */
    icon?: string
    /** The expanded menu's collapsible panel. */
    disclosurePanel?: string
    /** The collapsed menu's popover panel. */
    popoverPanel?: string
    /** The wrapper of the menu items, in both panels. */
    panelContent?: string
  }
}

export interface GsSidenavMenuItemProps {
  /** Prevents interaction and applies disabled styling. */
  disabled?: boolean
}

export interface GsSidenavHeadingProps {
  /** Heading level. Inside a button (a header or item) the heading renders as plain text. @default 3 */
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

/** Opens and closes every mounted `GsSidenav` by id, returned by `useSidenavs()`. */
export interface GsSidenavControls {
  open: (id: string) => void
  close: (id: string) => void
  toggle: (id: string) => void
  /** Whether a sidenav is open. Reactive: read it in a `computed` or a template. */
  isOpen: (id: string) => boolean
}
