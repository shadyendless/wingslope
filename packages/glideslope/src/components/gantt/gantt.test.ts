import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, nextTick, ref, type Component } from 'vue'
import GsIcon from '../icon/GsIcon.vue'
import { MS_PER_HOUR } from './constants'
import GsGantt from './GsGantt.vue'
import GsGanttBlock from './GsGanttBlock.vue'
import GsGanttBracketClose from './GsGanttBracketClose.vue'
import GsGanttBracketOpen from './GsGanttBracketOpen.vue'
import GsGanttContentContainer from './GsGanttContentContainer.vue'
import GsGanttContentRow from './GsGanttContentRow.vue'
import GsGanttIconMarker from './GsGanttIconMarker.vue'
import GsGanttMarker from './GsGanttMarker.vue'
import GsGanttPanelContainer from './GsGanttPanelContainer.vue'
import GsGanttPanelRow from './GsGanttPanelRow.vue'
import GsGanttSpacer from './GsGanttSpacer.vue'
import type { GsGanttMetThresholdData, GsGanttProps } from './types'

/** Tue Jan 27, 2026, 00:00 UTC. */
const START = 1769472000000
const hours = (count: number) => START + count * MS_PER_HOUR
/** Milliseconds per pixel at the `1h` timescale (80px per hour). */
const MS_PER_PX = MS_PER_HOUR / 80

const ROOT_HEIGHT = 400
const HEADER_WIDTH = 800

/**
 * jsdom has no layout. Give the chart's root and content a height and its header a width (class
 * names are unhashed in tests).
 */
function mockLayout() {
  const height = function (this: Element) {
    return this.classList.contains('root') || this.classList.contains('content') ? ROOT_HEIGHT : 0
  }
  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(height)
  // No horizontal scrollbar: the content's offset height equals its client height
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(height)
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(function (this: Element) {
    return this.classList.contains('header') || this.classList.contains('content')
      ? HEADER_WIDTH
      : 0
  })
}

/**
 * Waits for the chart to settle: it measures its root and header after mounting, then renders the
 * rows and timeline chunks that fit.
 */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

/** Runs animation frame callbacks right away. */
function immediateAnimationFrames() {
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callback(0)
    return 1
  })
}

beforeEach(() => {
  mockLayout()
  immediateAnimationFrames()
})

afterEach(() => {
  vi.restoreAllMocks()
})

type Props = Partial<GsGanttProps> & Record<string, unknown>

/**
 * A 48-hour chart at the `1h` timescale. It starts scrolled to hour 24, and with an 800px header
 * it renders 15 timeline chunks, from hour 22 to hour 36: the rendered region runs from hour 22 to
 * hour 37.
 */
async function renderGantt(
  rows: { panel: () => unknown; content: () => unknown },
  props: Props | (() => Props) = {},
) {
  const result = render(() =>
    h(
      GsGantt as Component,
      {
        startTimeMs: START,
        endTimeMs: hours(48),
        currentTimeMs: hours(25.5),
        timescale: '1h',
        ...(typeof props === 'function' ? props() : props),
      },
      () => [
        h(GsGanttPanelContainer, null, rows.panel),
        h(GsGanttContentContainer, null, rows.content),
      ],
    ),
  )
  await settle()
  return result
}

/** A chart with `count` rows labelled `Row <n>`, and the given elements in the first row. */
async function renderRows(count: number, elements: () => unknown = () => null, props: Props = {}) {
  const indexes = Array.from({ length: count }, (_, index) => index)
  return renderGantt(
    {
      panel: () => indexes.map((index) => h(GsGanttPanelRow, { key: index }, () => `Row ${index}`)),
      content: () =>
        indexes.map((index) =>
          h(GsGanttContentRow, { key: index }, () => (index === 0 ? elements() : null)),
        ),
    },
    props,
  )
}

const styleOf = (element: Element, property: string) =>
  (element as HTMLElement).style.getPropertyValue(property)

describe('GsGantt', () => {
  it('renders panel rows as list items of a list', async () => {
    await renderRows(3)

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Row 0',
      'Row 1',
      'Row 2',
    ])
  })

  it('renders only the rows in view, positioned among all rows', async () => {
    await renderRows(100)

    // (400px root - 64px header) / 40px rows = 9 visible rows, plus 1 overscan, made odd
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(11)
    expect(items[0]).toHaveTextContent('Row 0')
    expect(items[3]).toHaveStyle({ position: 'absolute', transform: 'translateY(120px)' })
  })

  it('sizes the scroll range from all the rows', async () => {
    const { container } = await renderRows(100)

    await waitFor(() =>
      expect(
        styleOf(container.querySelector('.virtualized-content-height')!, '--gantt-scroll-height'),
      ).toBe(`${100 * 40 + 64}px`),
    )
    expect(styleOf(container.querySelector('.stuck')!, '--gantt-visible-height')).toBe('400px')
  })

  it('renders the rows at the scroll position when the root scrolls', async () => {
    const { container } = await renderRows(100)
    const root = container.querySelector<HTMLElement>('.root')!
    const panel = container.querySelector<HTMLElement>('.panel')!
    const content = container.querySelector<HTMLElement>('.content')!

    root.scrollTop = 410
    await fireEvent.scroll(root)

    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Row 10')
    expect(items[0]).toHaveStyle({ transform: 'translateY(400px)' })
    // The panel and content sides scroll with the root
    expect(panel.scrollTop).toBe(410)
    expect(content.scrollTop).toBe(410)
  })

  it('starts the rendered rows at the first visible row, whatever the row height', async () => {
    const { container } = await renderRows(100, undefined, { rowHeightPx: 35 })
    const root = container.querySelector<HTMLElement>('.root')!

    root.scrollTop = 79
    await fireEvent.scroll(root)

    // Row 2 (70px to 105px) is at the top
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Row 2')
  })

  it('sets the row height', async () => {
    const { container } = await renderRows(1, undefined, { rowHeightPx: 60 })

    expect(styleOf(container.querySelector('.root')!, '--gantt-row-height')).toBe('60px')
  })

  it('passes classes and attributes to its root', async () => {
    const { container } = await renderRows(1, undefined, {
      class: 'h-full',
      'data-testid': 'gantt',
    })

    expect(container.querySelector('.root')).toHaveClass('h-full')
    expect(screen.getByTestId('gantt')).toHaveClass('root')
  })

  it('lets the keyboard reach both scroll containers, named', async () => {
    const first = await renderRows(1)
    const chart = screen.getByRole('region', { name: 'Gantt chart' })
    const timeline = screen.getByRole('group', { name: 'Timeline' })
    expect(chart).toHaveAttribute('tabindex', '0')
    expect(chart).toHaveClass('root')
    expect(timeline).toHaveAttribute('tabindex', '0')
    expect(timeline).toHaveClass('content')
    first.unmount()

    await renderRows(1, undefined, { 'aria-label': 'Strike package' })
    expect(screen.getByRole('region', { name: 'Strike package' })).toHaveClass('root')
  })

  describe('timeline', () => {
    it('labels the rendered chunks with times and dates', async () => {
      await renderRows(1)

      expect(screen.getByText('22:00')).toBeInTheDocument()
      expect(screen.getByText('28 JAN')).toBeInTheDocument()
      // The last chunk, at hour 36
      expect(screen.getByText('12:00')).toBeInTheDocument()
      expect(screen.queryByText('21:00')).not.toBeInTheDocument()
      expect(screen.queryByText('13:00')).not.toBeInTheDocument()
    })

    it('renders the chunks once a chart mounted while hidden is shown', async () => {
      // A hidden chart (a closed tab, a collapsed drawer) measures a 0px header and renders no
      // chunks, which leaves the chunk intersection observers nothing to watch.
      const resizeCallbacks: (() => void)[] = []
      vi.stubGlobal(
        'ResizeObserver',
        class {
          constructor(callback: () => void) {
            resizeCallbacks.push(callback)
          }
          observe() {}
          unobserve() {}
          disconnect() {}
        },
      )
      let hidden = true
      vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(function (
        this: Element,
      ) {
        return !hidden && (this.classList.contains('header') || this.classList.contains('content'))
          ? HEADER_WIDTH
          : 0
      })
      try {
        const { container } = await renderRows(1)
        expect(container.querySelector('.timeline')!.children).toHaveLength(0)

        hidden = false
        for (const callback of resizeCallbacks) callback()
        await settle()
        expect(screen.getByText('22:00')).toBeInTheDocument()
        expect(screen.getByText('12:00')).toBeInTheDocument()
      } finally {
        vi.unstubAllGlobals()
      }
    })

    it('slides the chunks with the horizontal scroll position', async () => {
      const { container } = await renderRows(1)
      const timeline = container.querySelector('.timeline')!
      const content = container.querySelector<HTMLElement>('.content')!

      // The first chunk (hour 22) is 2 hours left of the position (hour 24)
      await waitFor(() => expect(styleOf(timeline, '--translate-x')).toBe('-160px'))

      content.scrollLeft = (hours(25.5) - START) / MS_PER_PX
      await fireEvent.scroll(content)

      // The chunks now start at hour 23, 2.5 hours left of the position
      await waitFor(() => expect(styleOf(timeline, '--translate-x')).toBe('-200px'))
      expect(screen.getByText('23:00')).toBeInTheDocument()
    })

    it('scrolls to the middle of the range on mount', async () => {
      const { container } = await renderRows(1)

      await waitFor(() =>
        expect(container.querySelector('.content')!.scrollLeft).toBe(
          (hours(24) - START) / MS_PER_PX,
        ),
      )
    })

    it('keeps the position when the range changes, or resets it when outside the range', async () => {
      const range = ref({ startTimeMs: START, endTimeMs: hours(48) })
      const { container } = await renderGantt({ panel: () => null, content: () => null }, () => ({
        ...range.value,
      }))
      const content = container.querySelector<HTMLElement>('.content')!
      await waitFor(() => expect(content.scrollLeft).toBe(24 * 80))

      // Hour 24 is still in range: it stays at the left edge
      range.value = { startTimeMs: hours(12), endTimeMs: hours(48) }
      await waitFor(() => expect(content.scrollLeft).toBe(12 * 80))

      // Hour 24 is outside the new range: back to the start
      range.value = { startTimeMs: hours(30), endTimeMs: hours(60) }
      await waitFor(() => expect(content.scrollLeft).toBe(0))
    })

    it('marks the current time while it is in the rendered region', async () => {
      const { container } = await renderRows(1)

      expect(screen.getByText('01:30')).toBeInTheDocument()
      // 1.5 hours right of the position
      await waitFor(() =>
        expect(styleOf(container.querySelector('.current-time')!, '--translate-x')).toBe('120px'),
      )
    })

    it('hides the current time outside the rendered region', async () => {
      const { container } = await renderRows(1, undefined, { currentTimeMs: hours(2) })

      expect(container.querySelector('.current-time')).not.toBeInTheDocument()
    })
  })

  describe('elements', () => {
    it('renders range elements in the rendered region, positioned along the timeline', async () => {
      await renderRows(1, () => [
        h(GsGanttBlock, { startTimeMs: hours(24), endTimeMs: hours(26), 'data-testid': 'inside' }),
        h(GsGanttBlock, { startTimeMs: hours(1), endTimeMs: hours(2), 'data-testid': 'outside' }),
        h(GsGanttSpacer, {
          startTimeMs: hours(20),
          endTimeMs: hours(23),
          'data-testid': 'clipped',
        }),
      ])

      const inside = screen.getByTestId('inside')
      expect(styleOf(inside, '--translate-x')).toBe(`${24 * 80}px`)
      expect(styleOf(inside, '--width')).toBe(`${2 * 80}px`)
      expect(screen.queryByTestId('outside')).not.toBeInTheDocument()

      // Clipped to the rendered region, which starts at hour 22
      const clipped = screen.getByTestId('clipped')
      expect(styleOf(clipped, '--translate-x')).toBe(`${22 * 80}px`)
      expect(styleOf(clipped, '--width')).toBe('80px')
    })

    it('shows the elapsed part of range elements', async () => {
      await renderRows(1, () => [
        h(GsGanttBlock, { startTimeMs: hours(24), endTimeMs: hours(27), 'data-testid': 'block' }),
        h(GsGanttSpacer, { startTimeMs: hours(30), endTimeMs: hours(31), 'data-testid': 'spacer' }),
      ])

      expect(styleOf(screen.getByTestId('block'), '--elapsed-pct')).toBe('50%')
      expect(styleOf(screen.getByTestId('spacer'), '--elapsed-pct')).toBe('0%')
    })

    it('renders block content, colors and classes', async () => {
      await renderRows(1, () => [
        h(
          GsGanttBlock,
          { startTimeMs: hours(24), endTimeMs: hours(26), color: 'serious', class: 'extra' },
          () => 'MISSION ENTRY',
        ),
        h(GsGanttSpacer, { startTimeMs: hours(26), endTimeMs: hours(27), 'data-testid': 'spacer' }),
      ])

      const block = screen.getByText('MISSION ENTRY')
      expect(block).toHaveClass('block', 'extra')
      expect(block).toHaveAttribute('data-color', 'serious')
      expect(screen.getByTestId('spacer')).toHaveClass('spacer')
      expect(screen.getByTestId('spacer')).toHaveAttribute('data-color', 'accent')
    })

    it('renders point elements in the rendered region, muted once elapsed', async () => {
      await renderRows(1, () => [
        h(GsGanttMarker, { timeMs: hours(30), color: 'critical', 'data-testid': 'marker' }),
        h(GsGanttMarker, { timeMs: hours(25), 'data-testid': 'elapsed' }),
        h(GsGanttMarker, { timeMs: hours(40), 'data-testid': 'outside' }),
      ])

      const marker = screen.getByTestId('marker')
      expect(marker).toHaveClass('marker')
      expect(marker).toHaveAttribute('data-color', 'critical')
      expect(marker).not.toHaveAttribute('data-elapsed')
      expect(styleOf(marker, '--translate-x')).toBe(`${30 * 80}px`)
      expect(screen.getByTestId('elapsed')).toHaveAttribute('data-elapsed')
      expect(screen.queryByTestId('outside')).not.toBeInTheDocument()
    })

    it('renders brackets facing each way', async () => {
      await renderRows(1, () => [
        h(GsGanttBracketOpen, { timeMs: hours(24), 'data-testid': 'open' }),
        h(GsGanttBracketClose, { timeMs: hours(30), color: 'serious', 'data-testid': 'close' }),
      ])

      expect(screen.getByTestId('open')).toHaveAttribute('data-direction', 'open')
      expect(screen.getByTestId('open')).toHaveAttribute('data-elapsed')
      expect(screen.getByTestId('close')).toHaveAttribute('data-direction', 'close')
      expect(screen.getByTestId('close')).toHaveAttribute('data-color', 'serious')
      expect(screen.getByTestId('close')).toHaveClass('bracket')
    })

    it('scales the icon of an icon marker', async () => {
      await renderRows(1, () =>
        h(GsGanttIconMarker, { timeMs: hours(30), color: 'serious' }, () =>
          h(GsIcon, { 'data-testid': 'icon' }, () => h('svg')),
        ),
      )

      const icon = screen.getByTestId('icon')
      expect(icon).toHaveClass('icon', 'marker-icon-glyph')
      expect(icon.parentElement).toHaveClass('marker-icon')
      expect(icon.parentElement).toHaveAttribute('data-color', 'serious')
    })

    it('updates elements when the rendered region moves', async () => {
      const { container } = await renderRows(1, () =>
        h(GsGanttMarker, { timeMs: hours(38), 'data-testid': 'marker' }),
      )
      expect(screen.queryByTestId('marker')).not.toBeInTheDocument()

      const content = container.querySelector<HTMLElement>('.content')!
      content.scrollLeft = (hours(26) - START) / MS_PER_PX
      await fireEvent.scroll(content)

      expect(screen.getByTestId('marker')).toBeInTheDocument()
    })
  })

  describe('thresholds', () => {
    const threshold = { timescaleMultipleDistance: 3, rowIndexBoundaryDistance: 2 }

    it('emits the thresholds the rendered region meets', async () => {
      const onThresholdMet = vi.fn<(met: GsGanttMetThresholdData[]) => void>()
      await renderRows(5, undefined, { threshold, onThresholdMet })

      // All 5 rows are rendered, so both row thresholds (index 2) are met; the rendered time
      // (hours 22 to 37) is far from both ends (hours 3 and 45).
      await waitFor(() =>
        expect(onThresholdMet).toHaveBeenCalledWith([
          { axis: 'vertical', direction: 'start', value: 2 },
          { axis: 'vertical', direction: 'end', value: 2 },
        ]),
      )
    })

    it('emits only newly met thresholds as the rendered region moves', async () => {
      const onThresholdMet = vi.fn<(met: GsGanttMetThresholdData[]) => void>()
      const { container } = await renderRows(5, undefined, { threshold, onThresholdMet })
      await waitFor(() => expect(onThresholdMet).toHaveBeenCalledTimes(1))

      // Scroll to hour 34: the chunks then run to hour 47, past the end threshold (hour 45)
      const content = container.querySelector<HTMLElement>('.content')!
      content.scrollLeft = (hours(34) - START) / MS_PER_PX
      await fireEvent.scroll(content)
      await nextTick()

      expect(onThresholdMet).toHaveBeenCalledTimes(2)
      expect(onThresholdMet).toHaveBeenLastCalledWith([
        { axis: 'horizontal', direction: 'end', value: hours(45) },
      ])
    })

    it('does not emit without a threshold', async () => {
      const onThresholdMet = vi.fn()
      await renderRows(5, undefined, { onThresholdMet })
      await nextTick()

      expect(onThresholdMet).not.toHaveBeenCalled()
    })
  })

  it('throws when its parts are used outside a GsGantt', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const Orphan = defineComponent(() => () => h(GsGanttBlock, { startTimeMs: 0, endTimeMs: 1 }))

    expect(() => render(Orphan)).toThrow('Gantt components must be used within a GsGantt')
  })
})
