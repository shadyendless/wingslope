import { shallowReactive, shallowRef, type ShallowRef } from 'vue'
import type { GsSidenavControls } from './types'

/** The shared state of every sidenav mounted with one id. */
export interface SidenavRecord {
  open: ShallowRef<boolean>
  /** Mounted sidenavs with this id. */
  count: number
}

/**
 * Every mounted sidenav, by id. It lives at module level so sidenavs can be opened from anywhere,
 * including outside components. In server-side rendering it would be shared across requests, so
 * sidenavs only join it in the browser; on the server each one keeps its own state.
 */
const records = shallowReactive(new Map<string, SidenavRecord>())
const isClient = typeof window !== 'undefined'

/** @internal Adds a mounted sidenav to the sidenavs with this id, creating their state if needed. */
export function joinSidenav(id: string, open: boolean): SidenavRecord {
  let record = records.get(id)
  if (!record) {
    record = { open: shallowRef(open), count: 0 }
    if (isClient) records.set(id, record)
  }
  record.count++
  return record
}

/** @internal Removes a sidenav that unmounts; the state goes when the last one with its id does. */
export function leaveSidenav(id: string): void {
  const record = records.get(id)
  if (record && !--record.count) records.delete(id)
}

function set(id: string, open: (current: boolean) => boolean) {
  const record = records.get(id)
  if (record) record.open.value = open(record.open.value)
}

const controls: GsSidenavControls = {
  open: (id) => set(id, () => true),
  close: (id) => set(id, () => false),
  toggle: (id) => set(id, (open) => !open),
  isOpen: (id) => records.get(id)?.open.value ?? false,
}

/**
 * Opens, closes and toggles `GsSidenav`s from anywhere by id, and reads whether they are open. This
 * replaces the Design Toolkit's `Sidenav:*` bus events.
 *
 * Sidenavs are client-side state: in server-side rendering these functions do nothing. Bind
 * `v-model:open` on a `GsSidenav` to set its state while rendering.
 *
 * @example
 * ```ts
 * const sidenavs = useSidenavs()
 * sidenavs.toggle('app-nav')
 * const expanded = computed(() => sidenavs.isOpen('app-nav'))
 * ```
 */
export function useSidenavs(): GsSidenavControls {
  return controls
}
