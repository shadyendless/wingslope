import { describe, expect, it } from 'vitest'
import { computed, nextTick, watch } from 'vue'
import { GANTT_ROW_HEIGHT_PX, MS_PER_HOUR } from './constants'
import { createGanttStore, selectors } from './store'

describe('gantt store', () => {
  it('starts at the given position and setCurrentPositionMs updates it', () => {
    const store = createGanttStore({ startTimeMs: 0 })

    expect(selectors.currentPositionMs(store.state)).toBe(0)

    store.setCurrentPositionMs(5000)

    expect(selectors.currentPositionMs(store.state)).toBe(5000)
  })

  it('roundedCurrentPositionMs returns interval-rounded time', () => {
    const store = createGanttStore({ startTimeMs: 1738531200000 })

    expect(selectors.roundedCurrentPositionMs(MS_PER_HOUR)(store.state)).toBe(1738530000000)
  })

  it('currentRowScrollPx starts at 0 and its setter updates it', () => {
    const store = createGanttStore({ startTimeMs: 0 })

    expect(store.state.currentRowScrollPx).toBe(0)

    store.setCurrentRowScrollPx(123)

    expect(store.state.currentRowScrollPx).toBe(123)
  })

  it('roundedCurrentRowScrollPx rounds down to the row height', () => {
    const store = createGanttStore({ startTimeMs: 0 })
    store.setCurrentRowScrollPx(GANTT_ROW_HEIGHT_PX * 3 + 5)

    expect(selectors.roundedCurrentRowScrollPx()(store.state)).toBe(GANTT_ROW_HEIGHT_PX * 3)
    expect(selectors.roundedCurrentRowScrollPx(35)(store.state)).toBe(35 * 3)
  })

  it('is reactive, and a rounded selector only notifies when its value changes', async () => {
    const store = createGanttStore({ startTimeMs: 0 })
    const rounded = computed(() => selectors.roundedCurrentRowScrollPx()(store.state))
    const changes: number[] = []
    watch(rounded, (value) => changes.push(value))

    store.setCurrentRowScrollPx(5)
    await nextTick()
    store.setCurrentRowScrollPx(GANTT_ROW_HEIGHT_PX + 1)
    await nextTick()

    expect(changes).toEqual([GANTT_ROW_HEIGHT_PX])
  })
})
