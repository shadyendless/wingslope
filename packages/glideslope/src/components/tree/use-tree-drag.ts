/**
 * @internal `GsTree`'s drag-and-drop on dnd-kit: the `DragDropProvider` setup, the drag state and
 * the drop preview its rows show. The drop logic itself is in `drag-and-drop.ts`.
 *
 * Rows are dragged by a handle (`GsTreeDragHandle`), which is the dnd-kit activator, so the
 * Accessibility plugin's attributes (`aria-roledescription`, `aria-describedby`, `aria-pressed`)
 * land on the handle rather than on the `treeitem`, and Space / Enter on a row still select it.
 * Nothing is dnd-kit droppable: while dragging, the tree projects the pointer (or the arrow keys)
 * onto its rows itself, and dnd-kit's overlay follows the pointer.
 */
import type { DragEndEvent, DragMoveEvent, DragStartEvent } from '@dnd-kit/vue'
import { computed, nextTick, shallowRef, type ComputedRef } from 'vue'
import type { TreeDropView } from './context'
import { withAccessibility } from '../../lib/dnd-accessibility'
import {
  clampTreeDrop,
  describeTreeMove,
  getTreeDropGap,
  getTreeDropIndicator,
  getTreeDropMove,
  getTreeDropParent,
  getVisibleTreeRows,
  isTreeDropOrigin,
  startTreeDrag,
  stepTreeDrop,
  type TreeDrag,
  type TreeDropProjection,
  type TreeDropStep,
} from './drag-and-drop'
import { findTreeNode, getTreeAncestorKeys } from './tree-data'
import type { GsTreeKey, GsTreeMove, GsTreeNode, GsTreeVariant } from './types'

/** How far the pointer travels sideways to change the depth by one: a rule-line column. */
const INDENT: Record<GsTreeVariant, number> = { cozy: 28, compact: 20, crammed: 20 }

const INSTRUCTIONS =
  'To move this item, press Space or Enter. While moving it, use the up and down arrow keys to ' +
  'choose where it goes and the left and right arrow keys to change its level, then press Space ' +
  'or Enter to drop it, or Escape to cancel.'

interface DragState {
  drag: TreeDrag
  projection: TreeDropProjection
  /** The depth the user last chose with the keyboard, kept while stepping through gaps. */
  preferredDepth: number
  keyboard: boolean
  /** Where a pointer drag started, to measure its sideways travel. */
  startX: number
}

export interface UseTreeDragOptions<T> {
  nodes: () => readonly GsTreeNode<T>[]
  expanded: () => readonly GsTreeKey[]
  variant: () => GsTreeVariant
  /** Called with the move when a drag ends somewhere new. */
  move: (move: GsTreeMove) => void
}

/** The props and listeners `GsTree` binds to dnd-kit's `DragDropProvider`. */
export interface TreeDragProviderBindings {
  plugins: ReturnType<typeof withAccessibility>
  onDragStart: (event: DragStartEvent) => void
  onDragMove: (event: DragMoveEvent) => void
  onDragEnd: (event: DragEndEvent) => void
}

const isKeyboardEvent = (event: Event | null | undefined): event is KeyboardEvent =>
  typeof KeyboardEvent !== 'undefined' && event instanceof KeyboardEvent

const STEPS: Record<string, TreeDropStep> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

export function useTreeDrag<T>(options: UseTreeDragOptions<T>) {
  const state = shallowRef<DragState>()
  const rows = new Map<GsTreeKey, HTMLElement>()

  const label = (key: GsTreeKey) => findTreeNode(options.nodes(), key)?.label ?? key

  function registerRow(key: GsTreeKey, element: HTMLElement) {
    rows.set(key, element)
    return () => {
      if (rows.get(key) === element) rows.delete(key)
    }
  }

  /** The pointer's gap, from the rows' current positions (they move as the tree scrolls). */
  function pointerProjection(current: DragState, x: number, y: number): TreeDropProjection {
    const { drag, startX } = current
    const centers = drag.rows.map(({ key }) => {
      const rect = rows.get(key)?.getBoundingClientRect()
      return rect ? rect.top + rect.height / 2 : Number.NEGATIVE_INFINITY
    })
    const travel = Math.round((x - startX) / INDENT[options.variant()])
    return clampTreeDrop(drag.rows, getTreeDropGap(centers, y), drag.origin.depth + travel)
  }

  // dnd-kit hands the same move event to its Accessibility plugin (whose listener runs first) and
  // to `onDragMove`, so the next state is worked out once per event and shared.
  const nextStates = new WeakMap<DragMoveEvent, DragState>()
  function nextState(event: DragMoveEvent): DragState | undefined {
    const current = state.value
    if (!current) return undefined
    const cached = nextStates.get(event)
    if (cached) return cached
    let next = current
    const native = event.nativeEvent
    if (isKeyboardEvent(native)) {
      const step = STEPS[native.key]
      if (step) {
        const { projection, preferredDepth } = stepTreeDrop(
          current.drag,
          current.projection,
          current.preferredDepth,
          step,
        )
        next = { ...current, projection, preferredDepth }
      }
    } else if (event.to) {
      next = { ...current, projection: pointerProjection(current, event.to.x, event.to.y) }
    }
    nextStates.set(event, next)
    return next
  }

  function describe(current: DragState): string {
    const name = label(current.drag.source)
    if (isTreeDropOrigin(current.drag, current.projection)) {
      return `${name} is back in its original position.`
    }
    return `${name} will move ${describeTreeMove(getTreeDropMove(current.drag, current.projection), label)}.`
  }

  const plugins = withAccessibility({
    screenReaderInstructions: { draggable: INSTRUCTIONS },
    announcements: {
      dragstart: ({ operation }) =>
        operation.source ? `Picked up ${label(String(operation.source.id))}.` : undefined,
      dragmove: (event) => {
        const next = nextState(event)
        return next && describe(next)
      },
      dragend: ({ canceled }) => {
        const current = state.value
        if (!current) return undefined
        const name = label(current.drag.source)
        if (canceled) return `Moving ${name} was cancelled.`
        if (isTreeDropOrigin(current.drag, current.projection)) {
          return `${name} was dropped in its original position.`
        }
        return `${name} moved ${describeTreeMove(getTreeDropMove(current.drag, current.projection), label)}.`
      },
    },
  })

  function onDragStart({ operation }: DragStartEvent) {
    const source = operation.source
    if (!source) return
    const visible = getVisibleTreeRows(options.nodes(), new Set(options.expanded()))
    const drag = startTreeDrag(visible, String(source.id))
    if (!drag) return
    state.value = {
      drag,
      projection: drag.origin,
      preferredDepth: drag.origin.depth,
      keyboard: isKeyboardEvent(operation.activatorEvent),
      startX: operation.position.current.x,
    }
  }

  function onDragMove(event: DragMoveEvent) {
    if (!state.value) return
    // Keyboard drags step through rows instead of nudging the overlay by a few pixels.
    if (isKeyboardEvent(event.nativeEvent)) event.preventDefault()
    state.value = nextState(event)
  }

  function onDragEnd({ canceled }: DragEndEvent) {
    const current = state.value
    state.value = undefined
    if (!current || canceled || isTreeDropOrigin(current.drag, current.projection)) return
    const move = getTreeDropMove(current.drag, current.projection)
    options.move(move)
    // The moved row's element moves too, which drops the focus; give it back to its handle, or to
    // the nearest visible ancestor when the node went into a collapsed parent.
    if (current.keyboard) void nextTick(() => restoreFocus(current.drag.source))
  }

  function restoreFocus(key: GsTreeKey) {
    const handle = rows.get(key)?.querySelector<HTMLElement>('[data-tree-drag-handle]')
    if (handle) return handle.focus()
    // The node is hidden: its first collapsed ancestor (root first) is the nearest visible one.
    const expanded = new Set(options.expanded())
    const ancestor = getTreeAncestorKeys(options.nodes(), key).find((k) => !expanded.has(k))
    if (ancestor !== undefined) rows.get(ancestor)?.focus()
  }

  /**
   * While a keyboard drag runs, the keys belong to dnd-kit's keyboard sensor (which listens on the
   * document, before the tree). Keep them from the tree's own handlers, so Shift+arrows don't
   * extend the selection and letters don't jump to rows. The key that ends the drag arrives after
   * the drag state is gone; dnd-kit marks it handled.
   */
  function onKeydownCapture(event: KeyboardEvent) {
    const fromHandle = (event.target as HTMLElement | null)?.closest?.('[data-tree-drag-handle]')
    if (state.value?.keyboard || (event.defaultPrevented && fromHandle)) event.stopPropagation()
  }

  const drop: ComputedRef<TreeDropView | undefined> = computed(() => {
    const current = state.value
    if (!current) return undefined
    const { drag, projection } = current
    return {
      dragging: new Set([drag.source, ...drag.descendants]),
      parent: getTreeDropParent(drag, projection),
      indicator: getTreeDropIndicator(drag, projection),
    }
  })

  const provider: TreeDragProviderBindings = { plugins, onDragStart, onDragMove, onDragEnd }

  return { drop, registerRow, provider, onKeydownCapture, label }
}
