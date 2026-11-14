/** A command a `GsViewStackTrigger` can run on a stack. */
export type GsViewStackAction = 'back' | 'clear' | 'reset'

/**
 * What a `GsViewStackTrigger` does, as a string:
 *
 * - `'back'`, `'clear'` or `'reset'` acts on the surrounding `GsViewStack`.
 * - `'back:<stack id>'`, `'clear:<stack id>'` or `'reset:<stack id>'` acts on the stack with that
 *   id, from anywhere on the page.
 * - Any other string is a view id: it pushes that view onto the stack that renders it.
 */
export type GsViewStackTarget = GsViewStackAction | `${GsViewStackAction}:${string}` | (string & {})

export interface GsViewStackProps {
  /**
   * Identifies the stack for `useViewStacks()` and targeted triggers (`'back:<id>'`). Unique on the
   * page.
   */
  id: string
  /** View shown when the stack starts, and when `back` or `reset` would leave it empty. */
  defaultView?: string
}

export interface GsViewStackViewProps {
  /**
   * Identifies the view: pushing this id (with a trigger or `useViewStacks().push`) shows it. Unique
   * on the page.
   */
  id: string
}

export interface GsViewStackTriggerProps {
  /**
   * What clicking the trigger does: a `GsViewStackTarget`, or a list of them run in order, e.g.
   * `['clear', viewId]` to empty the stack and then show a view, or `[a, b, c]` to push three
   * views.
   */
  for: GsViewStackTarget | GsViewStackTarget[]
}

/**
 * Controls every mounted `GsViewStack` by id, returned by `useViewStacks()`. The getters are
 * reactive: read them in a `computed` or a template.
 */
export interface GsViewStackControls {
  /** Pushes a view onto the stacks that render it, showing it. */
  push: (view: string) => void
  /** Pops the top view of a stack. An emptied stack goes back to its `defaultView`, if any. */
  back: (stack: string) => void
  /** Removes every view from a stack, so it shows nothing. */
  clear: (stack: string) => void
  /** Returns a stack to its `defaultView`, or empties it when it has none. */
  reset: (stack: string) => void
  /** The views on a stack, oldest first. Empty for an unknown stack. */
  stack: (stack: string) => readonly string[]
  /** The view a stack shows (the top of the stack), or `null`. */
  view: (stack: string) => string | null
}
