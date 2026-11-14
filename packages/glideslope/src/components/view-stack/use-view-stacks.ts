import { shallowReactive, shallowRef, type ShallowRef } from 'vue'
import type { GsViewStackControls } from './types'

/** One mounted `GsViewStack` (or `GsDrawer`) and the views rendered inside it. */
export interface ViewStackInstance {
  /** View ids rendered inside it, with how many views use each id. */
  views: Map<string, number>
  defaultView: () => string | undefined
}

/** The shared state of every stack mounted with one id. */
export interface ViewStackRecord {
  /** Views on the stack, oldest first. Replaced on every change. */
  stack: ShallowRef<readonly string[]>
  instances: Set<ViewStackInstance>
}

/**
 * Every mounted stack, by id. It lives at module level so stacks can be driven from anywhere,
 * including outside components. In server-side rendering it would be shared across requests, so
 * stacks only join it in the browser; on the server each one keeps its own state.
 */
const records = shallowReactive(new Map<string, ViewStackRecord>())
const isClient = typeof window !== 'undefined'
const empty: readonly string[] = Object.freeze([])

function defaultViewOf(record: ViewStackRecord): string | undefined {
  for (const instance of record.instances) {
    const view = instance.defaultView()
    if (view) return view
  }
  return undefined
}

function initialStack(record: ViewStackRecord): readonly string[] {
  const view = defaultViewOf(record)
  return view ? [view] : empty
}

function hasView(record: ViewStackRecord, view: string): boolean {
  return [...record.instances].some((instance) => instance.views.has(view))
}

/** @internal Adds a mounted stack to the stacks with this id, creating their state if needed. */
export function joinViewStack(id: string, instance: ViewStackInstance): ViewStackRecord {
  let record = records.get(id)
  if (!record) {
    record = { stack: shallowRef(empty), instances: new Set([instance]) }
    record.stack.value = initialStack(record)
    if (isClient) records.set(id, record)
  }
  record.instances.add(instance)
  return record
}

/** @internal Removes a stack that unmounts; the state goes when the last stack with its id does. */
export function leaveViewStack(id: string, instance: ViewStackInstance): void {
  const record = records.get(id)
  if (!record?.instances.delete(instance)) return
  if (!record.instances.size) records.delete(id)
}

/** @internal Whether the stack with this id renders a view with this id. */
export function stackHasView(id: string, view: string): boolean {
  const record = records.get(id)
  return record ? hasView(record, view) : false
}

/** @internal Replaces the views on a stack. */
export function setStack(id: string, stack: readonly string[]): void {
  const record = records.get(id)
  if (record) record.stack.value = stack
}

const controls: GsViewStackControls = {
  push: (view) => {
    for (const record of records.values()) {
      if (hasView(record, view)) record.stack.value = [...record.stack.value, view]
    }
  },
  back: (id) => {
    const record = records.get(id)
    if (!record) return
    const next = record.stack.value.slice(0, -1)
    record.stack.value = next.length ? next : initialStack(record)
  },
  clear: (id) => setStack(id, empty),
  reset: (id) => {
    const record = records.get(id)
    if (record) record.stack.value = initialStack(record)
  },
  stack: (id) => records.get(id)?.stack.value ?? empty,
  view: (id) => records.get(id)?.stack.value.at(-1) ?? null,
}

/**
 * Drives `GsViewStack`s from anywhere by id, and reads which view each one shows. This replaces the
 * Design Toolkit's `ViewStack:*` bus events and `useViewStackEmit()`.
 *
 * Stacks are client-side state: in server-side rendering a stack shows its `defaultView` and these
 * functions do nothing.
 *
 * @example
 * ```ts
 * const viewStacks = useViewStacks()
 * viewStacks.push('details')
 * viewStacks.back('inspector')
 * const current = computed(() => viewStacks.view('inspector'))
 * ```
 */
export function useViewStacks(): GsViewStackControls {
  return controls
}
