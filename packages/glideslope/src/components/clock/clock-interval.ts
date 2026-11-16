const SECOND = 1000

/** Milliseconds until the clock next reaches a multiple of `interval`. */
function remainder(interval: number): number {
  return interval - (Date.now() % interval)
}

/**
 * Calls `callback` at the start of the next whole second, then every `ms` milliseconds, aligned to
 * the wall clock. Each timeout is computed from the current time, so drift never accumulates and a
 * clock showing seconds ticks over when the second does.
 *
 * @returns A function that stops the interval.
 */
export function setClockInterval(callback: () => void, ms: number): () => void {
  let timeout: ReturnType<typeof setTimeout> | undefined
  let cancelled = false

  function repeat() {
    if (cancelled) return
    callback()
    if (cancelled) return
    timeout = setTimeout(repeat, remainder(ms))
  }

  timeout = setTimeout(repeat, remainder(SECOND))

  return () => {
    cancelled = true
    clearTimeout(timeout)
  }
}
