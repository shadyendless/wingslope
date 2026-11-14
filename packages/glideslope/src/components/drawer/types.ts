import type { GsButtonColor, GsButtonSize, GsToggleButtonVariant } from '../button/types'
import type { GsViewStackControls } from '../view-stack/types'

type Top = 'top'
type Bottom = 'bottom'
type YAxisUnion = Top | Bottom
type YAxisIntersection = `${Top} ${Bottom}` | `${Bottom} ${Top}`
type Right = 'right'
type Left = 'left'
type XAxisUnion = Right | Left
type XAxisIntersection = `${Right} ${Left}` | `${Left} ${Right}`

/** Edge of a `GsDrawerLayout` a drawer slides in from. */
export type GsDrawerPlacement = XAxisUnion | YAxisUnion
export type GsDrawerSize = 'small' | 'medium' | 'large'
/** Where a `GsDrawerMenu` sits along its drawer's edge. */
export type GsDrawerMenuPosition = 'start' | 'center' | 'end'

/** Which drawers of a `GsDrawerLayout` span the full height or width. */
export type GsDrawerLayoutExtend = XAxisUnion | XAxisIntersection | YAxisUnion | YAxisIntersection

/** Which drawers of a `GsDrawerLayout` push the main content aside: one edge, or several. */
export type GsDrawerLayoutPush =
  | XAxisUnion
  | YAxisUnion
  | XAxisIntersection
  | YAxisIntersection
  | `${XAxisUnion} ${YAxisUnion}`
  | `${YAxisUnion} ${XAxisUnion}`
  | `${XAxisUnion} ${YAxisIntersection}`
  | `${YAxisIntersection} ${XAxisUnion}`
  | `${YAxisUnion} ${XAxisIntersection}`
  | `${XAxisIntersection} ${YAxisUnion}`
  | `${XAxisIntersection} ${YAxisIntersection}`
  | `${YAxisIntersection} ${XAxisIntersection}`

/** A command a `GsDrawerTrigger` can run on a drawer. */
export type GsDrawerAction = 'back' | 'clear' | 'close' | 'open' | 'reset' | 'toggle'

/**
 * What a `GsDrawerTrigger` does, as a string:
 *
 * - `'back'`, `'clear'`, `'close'` or `'reset'` acts on the surrounding drawer.
 * - `'open:<view id>'` empties the drawer that renders the view, then shows it. `'toggle:<view id>'`
 *   does the same, or closes the drawer when it already shows that view.
 * - `'close:<drawer or view id>'`, `'back:<drawer id>'`, `'clear:<drawer id>'` or
 *   `'reset:<drawer id>'` acts on a drawer from anywhere on the page.
 * - Any other string is a view id: it pushes that view onto the drawer's stack, on top of the view
 *   it shows (unlike `open`).
 */
export type GsDrawerTarget = GsDrawerAction | `${GsDrawerAction}:${string}` | (string & {})

export interface GsDrawerLayoutProps {
  /**
   * Which drawers extend to the full height or width of the layout, which decides the layout's
   * structure:
   *
   * ```
   * extend: 'left right'               extend: 'top bottom'
   * ┌──────┬──────────┬───────┐        ┌─────────────────────────┐
   * │      │   top    │       │        │          top            │
   * │      ├──────────┤       │        ├──────┬──────────┬───────┤
   * │ left │   main   │ right │        │ left │   main   │ right │
   * │      ├──────────┤       │        ├──────┴──────────┴───────┤
   * │      │  bottom  │       │        │         bottom          │
   * └──────┴──────────┴───────┘        └─────────────────────────┘
   *
   * extend: 'top'                      extend: 'bottom'
   * ┌─────────────────────────┐        ┌──────┬──────────┬───────┐
   * │          top            │        │      │   top    │       │
   * ├──────┬──────────┬───────┤        │ left ├──────────┤ right │
   * │      │   main   │       │        │      │   main   │       │
   * │ left ├──────────┤ right │        ├──────┴──────────┴───────┤
   * │      │  bottom  │       │        │         bottom          │
   * └──────┴──────────┴───────┘        └─────────────────────────┘
   *
   * extend: 'left'                     extend: 'right'
   * ┌──────┬──────────────────┐        ┌─────────────────┬───────┐
   * │      │   top            │        │          top    │       │
   * │      ├──────────┬───────│        ├──────┬──────────┤       │
   * │ left │   main   │ right │        │ left │   main   │ right │
   * │      ├──────────┴───────┤        ├──────┴──────────┤       │
   * │      │  bottom          │        │         bottom  │       │
   * └──────┴──────────────────┘        └─────────────────┴───────┘
   * ```
   *
   * @default 'left right'
   */
  extend?: GsDrawerLayoutExtend
  /**
   * Drawers on these edges push the main content aside, shrinking it, when they open. Drawers on
   * other edges float over the main content without changing its size.
   */
  push?: GsDrawerLayoutPush
}

export interface GsDrawerProps {
  /**
   * Identifies the drawer for `useDrawers()`, targeted triggers and `GsDrawerClose`'s `for`. It is
   * also the drawer element's `id`. Unique on the page.
   */
  id: string
  /** View shown when the drawer starts, and when `back` or `reset` would leave it empty. */
  defaultView?: string
  /** Edge of the layout the drawer slides in from. @default 'left' */
  placement?: GsDrawerPlacement
  /** Width (or height, for top and bottom drawers) of the open panel. @default 'medium' */
  size?: GsDrawerSize
}

export interface GsDrawerMenuProps {
  /** Where the menu sits along the drawer's edge. @default 'center' */
  position?: GsDrawerMenuPosition
}

export interface GsDrawerMenuItemProps {
  /**
   * Id of the view this item shows, matching a `GsDrawerView`'s `id`. The item is selected while
   * the drawer shows that view, or a view pushed on top of it.
   */
  for: string
  /**
   * Activating the item closes the drawer when it already shows the view. Without it, the item
   * only opens the view.
   */
  toggle?: boolean
  /** The item's accessible name and tooltip text. */
  textValue: string
  /** Prevents interaction and applies disabled styling. */
  disabled?: boolean
  /** @default 'medium' */
  size?: GsButtonSize
  /** @default 'accent' */
  color?: GsButtonColor
  /** @default 'icon' */
  variant?: GsToggleButtonVariant
  /** Classes for inner parts. `item`: the button. `tooltip`: its tooltip. */
  classes?: { item?: string; tooltip?: string }
}

export interface GsDrawerHeaderProps {
  /**
   * Title of a standard header: a back button (in pushed views), the title, and a close button.
   * Ignored when the default slot has content.
   */
  title?: string
}

export interface GsDrawerHeaderTitleProps {
  /** Heading level. Levels 1 to 3 use the large title size, 4 to 6 the medium one. @default 2 */
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

export interface GsDrawerViewProps {
  /**
   * Identifies the view: opening or pushing this id shows it. It is also the view element's `id`.
   * Unique on the page.
   */
  id: string
}

export interface GsDrawerCloseProps {
  /** Id of the drawer to close, or of a view in it. @default the surrounding drawer */
  for?: string
}

export interface GsDrawerTriggerProps {
  /**
   * What clicking the trigger does: a `GsDrawerTarget`, or a list of them run in order, e.g.
   * `['reset', viewId]` to reset the drawer and then push a view, or
   * `['open:<view in drawer A>', 'open:<view in drawer B>']` to open two drawers.
   */
  for: GsDrawerTarget | GsDrawerTarget[]
}

/**
 * Controls every mounted `GsDrawer` by id, returned by `useDrawers()`. A drawer is a view stack, so
 * the view stack commands work on drawers too. The getters are reactive.
 */
export interface GsDrawerControls extends GsViewStackControls {
  /** Empties the drawer that renders this view, then shows the view. */
  open: (view: string) => void
  /** Closes a drawer, given its id or the id of a view in it. */
  close: (target: string) => void
  /** Closes the drawer that renders this view if it shows it, and opens the view otherwise. */
  toggle: (view: string) => void
  /** Whether a drawer is open, that is, shows a view. */
  isOpen: (drawer: string) => boolean
}
