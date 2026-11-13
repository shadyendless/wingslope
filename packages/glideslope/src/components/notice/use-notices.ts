import { computed, getCurrentScope, onScopeDispose, shallowRef } from 'vue'
import type {
  GsNoticeActionEvent,
  GsNoticeActionKind,
  GsNoticeColor,
  GsNoticeContent,
  GsNoticeEvent,
  GsNoticeFilter,
  GsNoticeInput,
} from './types'

/**
 * The app-wide notice queue. It lives at module level so notices can be queued from anywhere,
 * including outside components (stores, request handlers). In server-side rendering it would be
 * shared across requests, so only queue notices on the client.
 *
 * The array is replaced on every change and its notices aren't made reactive, so metadata and
 * callbacks reach listeners as they were queued.
 */
const notices = shallowRef<readonly GsNoticeContent[]>([])
let counter = 0

/** Mounted lists, so `dequeue({ color })` can match notices shown in a list's `defaultColor`. */
interface MountedList {
  id: () => string | undefined
  defaultColor: () => GsNoticeColor
}
const lists = new Set<MountedList>()

const actionListeners = new Set<(event: GsNoticeActionEvent) => void>()
const closeListeners = new Set<(event: GsNoticeEvent) => void>()

function listen<T>(listeners: Set<T>, listener: T): () => void {
  // Lists only report events in the browser; on the server a listener would never be removed.
  if (typeof window === 'undefined') return () => {}
  listeners.add(listener)
  const stop = () => {
    listeners.delete(listener)
  }
  if (getCurrentScope()) onScopeDispose(stop)
  return stop
}

/** The colors a notice is shown in: its own, or the `defaultColor` of the lists showing it. */
function colorsOf(notice: GsNoticeContent): GsNoticeColor[] {
  if (notice.color) return [notice.color]
  const shown = [...lists].filter((list) => list.id() === notice.target)
  return shown.length ? shown.map((list) => list.defaultColor()) : ['info']
}

/** Deep equality for plain data: primitives, arrays, plain objects, dates, maps and sets. */
function isEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false
  if (a instanceof Date) return a.getTime() === (b as Date).getTime()
  if (a instanceof Map || a instanceof Set) {
    return isEqual([...a.entries()], [...(b as Map<unknown, unknown>).entries()])
  }
  if (Array.isArray(a)) {
    const other = b as unknown[]
    return a.length === other.length && a.every((value, index) => isEqual(value, other[index]))
  }
  const left = a as Record<string, unknown>
  const right = b as Record<string, unknown>
  const keys = Object.keys(left)
  return (
    keys.length === Object.keys(right).length &&
    keys.every((key) => Object.hasOwn(right, key) && isEqual(left[key], right[key]))
  )
}

/** Whether a notice matches every criterion of a dequeue filter (see `GsNoticeFilter`). */
function matches(filter: GsNoticeFilter, notice: GsNoticeContent): boolean {
  if (filter.id && filter.id !== notice.id) return false
  if (filter.target && filter.target !== notice.target) return false
  if (filter.color && !colorsOf(notice).includes(filter.color)) return false
  if (!filter.metadata) return true
  const metadata = notice.metadata
  if (!metadata) return false
  return Object.entries(filter.metadata).every(
    ([key, value]) => Object.hasOwn(metadata, key) && isEqual(metadata[key], value),
  )
}

/** @internal Lets a mounted `GsNoticeList` take part in color matching. */
export function registerNoticeList(list: MountedList): () => void {
  lists.add(list)
  return () => {
    lists.delete(list)
  }
}

/** @internal Tells `onAction` listeners that a notice's action was chosen. */
export function reportNoticeAction(notice: GsNoticeContent, action: GsNoticeActionKind) {
  const event = { id: notice.id, metadata: notice.metadata, action }
  for (const listener of [...actionListeners]) listener(event)
}

/** @internal Tells `onClose` listeners that a notice was closed. */
export function reportNoticeClose(notice: GsNoticeContent) {
  const event = { id: notice.id, metadata: notice.metadata }
  for (const listener of [...closeListeners]) listener(event)
}

/**
 * Queues and dismisses notices shown by `GsNoticeList`, and listens to what users do with them.
 *
 * @example
 * ```ts
 * const { queue, dequeue, onAction } = useNotices()
 * queue({
 *   message: 'Layer failed to load',
 *   color: 'critical',
 *   primary: { label: 'Retry' },
 *   metadata: { layerId: 'roads' },
 * })
 * onAction(({ metadata }) => retry(metadata?.layerId))
 * dequeue({ metadata: { layerId: 'roads' } })
 * ```
 */
export function useNotices() {
  return {
    /** Every queued notice, oldest first. */
    notices: computed(() => notices.value),

    /** Adds a notice and returns its id. Queuing an existing id replaces that notice. */
    queue: (notice: GsNoticeInput): string => {
      const id = notice.id ?? `gs-notice-${++counter}`
      notices.value = [...notices.value.filter((n) => n.id !== id), { ...notice, id }]
      return id
    },

    /**
     * Removes the notice with this id, or every notice matching a filter: all of `id`, `target`,
     * `color` and `metadata` that are given. Without `target`, notices in every list match.
     */
    dequeue: (filter: string | GsNoticeFilter): void => {
      const criteria = typeof filter === 'string' ? { id: filter } : filter
      notices.value = notices.value.filter((notice) => !matches(criteria, notice))
    },

    /** Removes every notice, or only those targeting one list. */
    clear: (target?: string): void => {
      notices.value =
        target === undefined ? [] : notices.value.filter((notice) => notice.target !== target)
    },

    /**
     * Calls `listener` with `{ id, metadata, action }` when a notice's primary or secondary action
     * is chosen in any list. Returns a function that stops listening; inside a component, that
     * happens on unmount too.
     */
    onAction: (listener: (event: GsNoticeActionEvent) => void): (() => void) =>
      listen(actionListeners, listener),

    /**
     * Calls `listener` with `{ id, metadata }` when a list closes a notice: its close button,
     * Escape, a swipe, its timeout, an action with `closeOnAction`, or "Clear all". Not when code
     * removes it with `dequeue` or `clear`. Returns a function that stops listening; inside a
     * component, that happens on unmount too.
     */
    onClose: (listener: (event: GsNoticeEvent) => void): (() => void) =>
      listen(closeListeners, listener),
  }
}
