/**
 * @internal What `GsGantt` provides to its parts.
 *
 * The Design Toolkit nests three providers in `GanttProvider`: `GanttContext` (the chart's
 * elements and row height), the store (`./store.ts`) and `TemporalDataContext` (the time scale and
 * the rendered region, built by `useTemporalData`). `GsGantt` creates and provides all three.
 */
import {
  inject,
  provide,
  type ComponentPublicInstance,
  type InjectionKey,
  type Ref,
  type ShallowRef,
} from 'vue'
import type {
  GsGanttMetThresholdData,
  GsGanttThreshold,
  GsGanttTimeBounds,
  GsGanttTimelineChunkObject,
  GsGanttTimescale,
} from './types'

export interface GanttContext {
  /** The vertical scroll container (the chart's root element). */
  rootElement: ShallowRef<HTMLDivElement | null>
  /** The content side's timeline header; its width is the visible timeline width. */
  headerElement: ShallowRef<HTMLDivElement | null>
  /** The content side (`GsGanttContentContainer`), which scrolls horizontally. */
  ganttContentElement: ShallowRef<HTMLDivElement | null>
  /** The panel side (`GsGanttPanelContainer`). */
  ganttPanelElement: ShallowRef<HTMLDivElement | null>
  rowHeightPx: Readonly<Ref<number>>
  /** The root element's client height, kept current by a `ResizeObserver`. */
  rootElementHeight: Readonly<Ref<number>>
}

export interface TemporalDataContext {
  /** Milliseconds one pixel of timeline stands for. */
  msPerPx: Readonly<Ref<number>>
  /** Time range covered by the rendered timeline chunks, visible or not. */
  renderedRegionBounds: Readonly<Ref<GsGanttTimeBounds>>
  timescale: Readonly<Ref<GsGanttTimescale>>
  /** The chart's whole time range (`startTimeMs`, `endTimeMs`). */
  totalBounds: Readonly<Ref<GsGanttTimeBounds>>
  timelineChunks: Readonly<Ref<GsGanttTimelineChunkObject[]>>
  threshold: Readonly<Ref<GsGanttThreshold | undefined>>
  currentTimeMs: Readonly<Ref<number>>
  onThresholdMet: (metThresholds: GsGanttMetThresholdData[]) => void
}

const ganttKey: InjectionKey<GanttContext> = Symbol('GsGantt')
const temporalDataKey: InjectionKey<TemporalDataContext> = Symbol('GsGanttTemporalData')

export function provideGanttContext(context: GanttContext) {
  provide(ganttKey, context)
}

/** @throws {Error} Outside a `GsGantt`. */
export function injectGanttContext(): GanttContext {
  const context = inject(ganttKey, null)

  if (!context) {
    throw new Error('Gantt components must be used within a GsGantt')
  }

  return context
}

export function provideTemporalDataContext(context: TemporalDataContext) {
  provide(temporalDataKey, context)
}

/** @throws {Error} Outside a `GsGantt`. */
export function injectTemporalDataContext(): TemporalDataContext {
  const context = inject(temporalDataKey, null)

  if (!context) {
    throw new Error('Gantt components must be used within a GsGantt')
  }

  return context
}

/**
 * A function template ref that stores an element in one of the context's element refs (the
 * Design Toolkit's `assign…ElementRef` setters). Create it once in setup, so it is stable.
 */
export function elementRef(target: ShallowRef<HTMLDivElement | null>) {
  return (element: Element | ComponentPublicInstance | null) => {
    target.value = element as HTMLDivElement | null
  }
}
