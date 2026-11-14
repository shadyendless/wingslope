import { inject, provide, readonly, type InjectionKey } from 'vue'
import type { GsFlashcardState } from './types'

const key: InjectionKey<GsFlashcardState> = Symbol('GsFlashcard')

const empty: GsFlashcardState = readonly({ loading: false, header: '', subheader: '' })

export function provideFlashcardContext(state: GsFlashcardState) {
  provide(key, state)
}

/**
 * Reads the state of the nearest `GsFlashcard`: `loading`, `header` and `subheader`, all reactive.
 * Use it to build parts of your own that follow the card's loading state. Outside a flashcard it
 * reports an empty card that isn't loading.
 *
 * @example
 * ```ts
 * const flashcard = useFlashcard()
 * const label = computed(() => (flashcard.loading ? 'Loading…' : flashcard.header))
 * ```
 */
export function useFlashcard(): GsFlashcardState {
  return inject(key, empty)
}
