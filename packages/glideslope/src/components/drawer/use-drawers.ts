import { setStack, stackHasView, useViewStacks } from '../view-stack/use-view-stacks'
import type { GsDrawerControls } from './types'

/**
 * Ids of mounted drawers, with how many drawers use each. A drawer's state is its view stack's
 * (see `useViewStacks`); this only marks which stacks are drawers, so `open`, `close` and `toggle`
 * leave plain view stacks alone. Client-only, like the stacks.
 */
const drawers = new Map<string, number>()
const isClient = typeof window !== 'undefined'

/** @internal Marks a mounted view stack as a drawer; returns the function that unmarks it. */
export function registerDrawer(id: string): () => void {
  if (!isClient) return () => {}
  drawers.set(id, (drawers.get(id) ?? 0) + 1)
  return () => {
    const count = (drawers.get(id) ?? 1) - 1
    if (count) drawers.set(id, count)
    else drawers.delete(id)
  }
}

/** Drawers that render the view. */
function drawersWith(view: string): string[] {
  return [...drawers.keys()].filter((drawer) => stackHasView(drawer, view))
}

const viewStacks = useViewStacks()

const controls: GsDrawerControls = {
  ...viewStacks,
  open: (view) => {
    for (const drawer of drawersWith(view)) setStack(drawer, [view])
  },
  close: (target) => {
    for (const drawer of drawers.keys()) {
      if (drawer === target || stackHasView(drawer, target)) viewStacks.clear(drawer)
    }
  },
  toggle: (view) => {
    for (const drawer of drawersWith(view)) {
      setStack(drawer, viewStacks.view(drawer) === view ? [] : [view])
    }
  },
  isOpen: (drawer) => viewStacks.view(drawer) !== null,
}

/**
 * Opens, closes and navigates `GsDrawer`s from anywhere by id, and reads their state. This replaces
 * the Design Toolkit's `Drawer:*` and `ViewStack:*` bus events, `DrawerEventHandlers` and
 * `useDrawerEmit()`.
 *
 * Drawers are client-side state: in server-side rendering a drawer shows its `defaultView` and these
 * functions do nothing.
 *
 * @example
 * ```ts
 * const drawers = useDrawers()
 * drawers.open('layers')
 * drawers.toggle('layers')
 * drawers.close('left-drawer')
 * const layersOpen = computed(() => drawers.isOpen('left-drawer'))
 * ```
 */
export function useDrawers(): GsDrawerControls {
  return controls
}
