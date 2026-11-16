import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { computed, nextTick, shallowRef } from 'vue'
import { withGanttProviders } from '../__fixtures__/providers'
import * as thresholdUtils from '../utils/thresholds'
import { useTotalDataRegionThresholds } from './use-total-data-region-thresholds'
import type { GsGanttMetThresholdData, GsGanttThreshold } from '../types'

// Only mock the decision functions: the pure derivation functions run for real.
vi.mock('../utils/thresholds', async () => {
  const actual = await vi.importActual<typeof thresholdUtils>('../utils/thresholds')
  return {
    ...actual,
    shouldExamineThresholds: vi.fn(),
    examineThresholds: vi.fn(),
  }
})

describe('useTotalDataRegionThresholds', () => {
  const threshold: GsGanttThreshold = { timescaleMultipleDistance: 2, rowIndexBoundaryDistance: 2 }
  const verticalScrollElement = { clientHeight: 500 } as HTMLElement
  const metThresholds: GsGanttMetThresholdData[] = [
    { axis: 'horizontal', direction: 'start', value: 3000 },
  ]

  beforeEach(() => {
    vi.mocked(thresholdUtils.shouldExamineThresholds).mockReturnValue(true)
    vi.mocked(thresholdUtils.examineThresholds).mockReturnValue([])
  })

  /** Runs the composable with a reactive row count, which the tests change to re-run it. */
  function setup(options: { threshold?: GsGanttThreshold } = { threshold }) {
    const onThresholdMet = vi.fn()
    const totalRowsCount = shallowRef(10)

    withGanttProviders(
      () => useTotalDataRegionThresholds({ totalRowsCount, verticalScrollElement }),
      {
        temporalData: {
          totalBounds: computed(() => ({ startMs: 1000, endMs: 10000 })),
          renderedRegionBounds: computed(() => ({ startMs: 2000, endMs: 8000 })),
          threshold: computed(() => options.threshold),
          onThresholdMet,
        },
      },
    )

    const rerender = async (rows: number) => {
      totalRowsCount.value = rows
      await nextTick()
    }

    return { onThresholdMet, rerender }
  }

  it('does not call onThresholdMet without a threshold', () => {
    vi.mocked(thresholdUtils.examineThresholds).mockReturnValue(metThresholds)

    const { onThresholdMet } = setup({ threshold: undefined })

    expect(onThresholdMet).not.toHaveBeenCalled()
  })

  it('does not call onThresholdMet when shouldExamineThresholds returns false', () => {
    vi.mocked(thresholdUtils.shouldExamineThresholds).mockReturnValue(false)
    vi.mocked(thresholdUtils.examineThresholds).mockReturnValue(metThresholds)

    const { onThresholdMet } = setup()

    expect(onThresholdMet).not.toHaveBeenCalled()
  })

  it('calls onThresholdMet when thresholds are met', () => {
    vi.mocked(thresholdUtils.examineThresholds).mockReturnValue(metThresholds)

    const { onThresholdMet } = setup()

    expect(onThresholdMet).toHaveBeenCalledWith(metThresholds)
  })

  it('does not call onThresholdMet when no thresholds are met', () => {
    const { onThresholdMet } = setup()

    expect(onThresholdMet).not.toHaveBeenCalled()
  })

  it('re-runs when its inputs change and thresholds are newly entered', async () => {
    vi.mocked(thresholdUtils.examineThresholds)
      .mockReturnValueOnce([])
      .mockReturnValueOnce(metThresholds)

    const { onThresholdMet, rerender } = setup()

    expect(onThresholdMet).not.toHaveBeenCalled()

    await rerender(20)

    expect(onThresholdMet).toHaveBeenCalledTimes(1)
    expect(onThresholdMet).toHaveBeenCalledWith(metThresholds)
  })

  it('does not call onThresholdMet again while the same threshold stays met', async () => {
    vi.mocked(thresholdUtils.examineThresholds).mockReturnValue(metThresholds)

    const { onThresholdMet, rerender } = setup()
    await rerender(20)

    expect(onThresholdMet).toHaveBeenCalledTimes(1)
  })

  it('calls onThresholdMet again after a threshold is left and re-entered', async () => {
    vi.mocked(thresholdUtils.examineThresholds)
      .mockReturnValueOnce(metThresholds) // enter
      .mockReturnValueOnce([]) // leave
      .mockReturnValueOnce(metThresholds) // re-enter

    const { onThresholdMet, rerender } = setup()
    expect(onThresholdMet).toHaveBeenCalledTimes(1)

    await rerender(20)
    expect(onThresholdMet).toHaveBeenCalledTimes(1)

    await rerender(30)
    expect(onThresholdMet).toHaveBeenCalledTimes(2)
  })

  it('only reports newly entered thresholds', async () => {
    const alreadyMet: GsGanttMetThresholdData[] = [
      { axis: 'horizontal', direction: 'start', value: 3000 },
    ]
    const newlyMet: GsGanttMetThresholdData[] = [{ axis: 'vertical', direction: 'end', value: 7 }]
    vi.mocked(thresholdUtils.examineThresholds)
      .mockReturnValueOnce(alreadyMet)
      .mockReturnValueOnce([...alreadyMet, ...newlyMet])

    const { onThresholdMet, rerender } = setup()
    expect(onThresholdMet).toHaveBeenCalledWith(alreadyMet)

    await rerender(20)

    expect(onThresholdMet).toHaveBeenCalledTimes(2)
    expect(onThresholdMet).toHaveBeenLastCalledWith(newlyMet)
  })

  it('reports a threshold again when its value changes', async () => {
    const firstMet: GsGanttMetThresholdData[] = [
      { axis: 'horizontal', direction: 'start', value: 3000 },
    ]
    const changedValue: GsGanttMetThresholdData[] = [
      { axis: 'horizontal', direction: 'start', value: 4000 },
    ]
    vi.mocked(thresholdUtils.examineThresholds)
      .mockReturnValueOnce(firstMet)
      .mockReturnValueOnce(changedValue)

    const { onThresholdMet, rerender } = setup()
    await rerender(20)

    expect(onThresholdMet).toHaveBeenCalledTimes(2)
    expect(onThresholdMet).toHaveBeenLastCalledWith(changedValue)
  })

  it('reports thresholds again after examination stopped and resumed', async () => {
    vi.mocked(thresholdUtils.examineThresholds).mockReturnValue(metThresholds)

    const { onThresholdMet, rerender } = setup()
    expect(onThresholdMet).toHaveBeenCalledTimes(1)

    // Stopping examination resets what was met
    vi.mocked(thresholdUtils.shouldExamineThresholds).mockReturnValueOnce(false)
    await rerender(0)
    expect(onThresholdMet).toHaveBeenCalledTimes(1)

    await rerender(10)
    expect(onThresholdMet).toHaveBeenCalledTimes(2)
    expect(onThresholdMet).toHaveBeenLastCalledWith(metThresholds)
  })
})
