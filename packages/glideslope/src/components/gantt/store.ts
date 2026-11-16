/**
 * @internal The per-chart store: the scroll position along both axes and the virtualized height.
 *
 * The Design Toolkit keeps this in a `zustand` store (with `subscribeWithSelector`). Here it is a
 * `shallowReactive` object created once per `GsGantt` and provided to its descendants, with the
 * same state, actions and selectors. Scroll handlers write it on every scroll event, so readers
 * should depend on a selector that changes less often (`roundedCurrentPositionMs`,
 * `roundedCurrentRowScrollPx`) unless they follow the scroll position every frame, as the layout
 * subscriptions do (see `useLayoutSubscription`).
 */
import {
  computed,
  inject,
  provide,
  shallowReactive,
  type ComputedRef,
  type InjectionKey,
} from 'vue'
import { GANTT_ROW_HEIGHT_PX } from './constants'
import { roundMsToInterval } from './utils/dates'

export interface GanttState {
  /** Time at the left edge of the visible timeline, in epoch milliseconds. */
  currentPositionMs: number
  /** Vertical scroll offset of the rows, in pixels. */
  currentRowScrollPx: number
  /** Height of all rows plus the horizontal scrollbar, in pixels. */
  virtualizedHeightPx: number
}

export interface GanttActions {
  setCurrentPositionMs: (ms: number) => void
  setCurrentRowScrollPx: (px: number) => void
  setVirtualizedHeightPx: (px: number) => void
}

export interface GanttStore extends GanttActions {
  /** The reactive state. Change it through the actions. */
  readonly state: Readonly<GanttState>
}

export const selectors = {
  currentPositionMs: (state: GanttState) => state.currentPositionMs,
  roundedCurrentPositionMs: (selectedTimeIntervalMs: number) => (state: GanttState) =>
    roundMsToInterval(state.currentPositionMs, selectedTimeIntervalMs),
  /**
   * The row scroll rounded down to a whole row. The Design Toolkit always rounds to the default
   * 40px row height, which, with shorter rows, could leave the bottom row unrendered while
   * scrolling; this rounds to the chart's row height.
   */
  roundedCurrentRowScrollPx:
    (rowHeightPx: number = GANTT_ROW_HEIGHT_PX) =>
    (state: GanttState) =>
      Math.floor(state.currentRowScrollPx / rowHeightPx) * rowHeightPx,
  virtualizedHeightPx: (state: GanttState) => state.virtualizedHeightPx,
}

export interface GanttStoreProps {
  /** Initial `currentPositionMs`. */
  startTimeMs: number
}

export function createGanttStore({ startTimeMs }: GanttStoreProps): GanttStore {
  const state = shallowReactive<GanttState>({
    currentPositionMs: startTimeMs,
    currentRowScrollPx: 0,
    virtualizedHeightPx: 0,
  })

  return {
    state,
    setCurrentPositionMs: (ms) => {
      state.currentPositionMs = ms
    },
    setCurrentRowScrollPx: (px) => {
      state.currentRowScrollPx = px
    },
    setVirtualizedHeightPx: (px) => {
      state.virtualizedHeightPx = px
    },
  }
}

const key: InjectionKey<GanttStore> = Symbol('GsGanttStore')

export function provideGanttStore(store: GanttStore) {
  provide(key, store)
}

/**
 * The chart's store (the Design Toolkit's `useGanttStoreApi`).
 *
 * @throws {Error} Outside a `GsGantt`.
 */
export function injectGanttStore(): GanttStore {
  const store = inject(key, null)

  if (!store) {
    throw new Error('Gantt components must be used within a GsGantt')
  }

  return store
}

/**
 * A selected store value (the Design Toolkit's `useGanttStore(selector)`). Like a `zustand`
 * selector, its dependents only update when the selected value changes.
 */
export function useGanttStore<T>(selector: (state: GanttState) => T): ComputedRef<T> {
  const store = injectGanttStore()

  return computed(() => selector(store.state))
}
