/**
 * Test helpers: run a composable inside the providers `GsGantt` sets up, without rendering a
 * chart. The Design Toolkit's `createGanttStoreProvider`, extended to the other two contexts.
 */
/* eslint-disable vue/one-component-per-file -- a host that provides, and a child that injects */
import { render } from '@testing-library/vue'
import { computed, defineComponent, h, shallowRef } from 'vue'
import {
  provideGanttContext,
  provideTemporalDataContext,
  type GanttContext,
  type TemporalDataContext,
} from '../context'
import { createGanttStore, provideGanttStore, type GanttStore } from '../store'

export interface ProvidersOptions {
  startTimeMs?: number
  context?: Partial<GanttContext>
  temporalData?: Partial<TemporalDataContext>
}

export function createGanttContext(overrides: Partial<GanttContext> = {}): GanttContext {
  return {
    rootElement: shallowRef<HTMLDivElement | null>(null),
    headerElement: shallowRef<HTMLDivElement | null>(null),
    ganttContentElement: shallowRef<HTMLDivElement | null>(null),
    ganttPanelElement: shallowRef<HTMLDivElement | null>(null),
    rowHeightPx: computed(() => 40),
    rootElementHeight: computed(() => 0),
    ...overrides,
  }
}

export function createTemporalDataContext(
  overrides: Partial<TemporalDataContext> = {},
): TemporalDataContext {
  return {
    msPerPx: computed(() => 1),
    renderedRegionBounds: computed(() => ({ startMs: 0, endMs: 0 })),
    timescale: computed(() => '1h'),
    totalBounds: computed(() => ({ startMs: 0, endMs: 0 })),
    timelineChunks: computed(() => []),
    threshold: computed(() => undefined),
    currentTimeMs: computed(() => 0),
    onThresholdMet: () => {},
    ...overrides,
  }
}

/**
 * Renders a component whose setup runs `setup` below the Gantt providers. Returns its result, the
 * store and the render result (to unmount).
 */
export function withGanttProviders<T>(setup: () => T, options: ProvidersOptions = {}) {
  const store: GanttStore = createGanttStore({ startTimeMs: options.startTimeMs ?? 0 })
  const result: { value: T | undefined } = { value: undefined }

  const Child = defineComponent({
    setup() {
      result.value = setup()
      return () => null
    },
  })

  const Providers = defineComponent({
    setup() {
      provideGanttStore(store)
      provideGanttContext(createGanttContext(options.context))
      provideTemporalDataContext(createTemporalDataContext(options.temporalData))
      return () => h(Child)
    },
  })

  const rendered = render(Providers)

  return { result: result.value as T, store, ...rendered }
}
