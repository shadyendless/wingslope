import { onScopeDispose } from 'vue'

export interface UseTimeoutCleanupResult {
  /** Registers a timeout to be cleared when the calling component unmounts. */
  registerTimeout: (timeoutId: ReturnType<typeof setTimeout>) => void
}

/**
 * Clears registered timeouts when the calling component (or effect scope) is disposed, so
 * deferred focus moves and validation don't run after unmount.
 *
 * @example
 * ```ts
 * const { registerTimeout } = useTimeoutCleanup()
 * registerTimeout(setTimeout(() => input.value?.focus(), 0))
 * ```
 */
export function useTimeoutCleanup(): UseTimeoutCleanupResult {
  const timeoutIds = new Set<ReturnType<typeof setTimeout>>()

  onScopeDispose(() => {
    timeoutIds.forEach(clearTimeout)
    timeoutIds.clear()
  })

  return {
    registerTimeout: (timeoutId) => {
      timeoutIds.add(timeoutId)
    },
  }
}
