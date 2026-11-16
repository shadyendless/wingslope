import { render, screen } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { nextTick } from 'vue'
import GsClock from './GsClock.vue'
import { setClockInterval } from './clock-interval'

beforeEach(() => {
  vi.useFakeTimers()
  // Half a second past 15:54:14 UTC, so the first tick lands 500ms later.
  vi.setSystemTime(new Date('2025-09-30T15:54:14.500Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('GsClock', () => {
  it('renders the current UTC time in a <time> element', () => {
    render(GsClock)
    const time = screen.getByText('15:54:14 UTC')
    expect(time.tagName).toBe('TIME')
    expect(time).toHaveAttribute('datetime', '2025-09-30T15:54:14.500Z')
  })

  it('ticks over at the start of each second', async () => {
    render(GsClock)
    await vi.advanceTimersByTimeAsync(499)
    expect(screen.getByText('15:54:14 UTC')).toBeInTheDocument()
    await vi.advanceTimersByTimeAsync(1)
    expect(screen.getByText('15:54:15 UTC')).toBeInTheDocument()
    await vi.advanceTimersByTimeAsync(1000)
    expect(screen.getByText('15:54:16 UTC')).toBeInTheDocument()
  })

  it('uses a custom formatter, and reformats when it changes', async () => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'long',
      timeZone: 'UTC',
      hour12: false,
    })
    const view = render(GsClock, { props: { formatter } })
    expect(screen.getByText('9/30/25, 15:54:14 UTC')).toBeInTheDocument()

    await view.rerender({
      formatter: new Intl.DateTimeFormat('en-US', { timeStyle: 'short', timeZone: 'UTC' }),
    })
    await nextTick()
    expect(screen.getByText('3:54 PM')).toBeInTheDocument()
  })

  it('takes classes and attributes on the <time> element', () => {
    render(GsClock, { attrs: { class: 'fg-accent-primary-bold', 'aria-label': 'Zulu time' } })
    expect(screen.getByText('15:54:14 UTC')).toHaveClass('fg-accent-primary-bold')
    expect(screen.getByText('15:54:14 UTC')).toHaveAttribute('aria-label', 'Zulu time')
  })

  it('stops its timer when unmounted', () => {
    const view = render(GsClock)
    expect(vi.getTimerCount()).toBe(1)
    view.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('setClockInterval', () => {
  it('corrects drift so each call lands on the interval boundary', () => {
    const calls: number[] = []
    const stop = setClockInterval(() => {
      calls.push(Date.now() % 1000)
      // Simulate a slow callback: the next timeout must still land on the boundary.
      vi.setSystemTime(Date.now() + 120)
    }, 1000)
    vi.advanceTimersByTime(3000)
    stop()
    expect(calls).toEqual([0, 0, 0])
  })
})
