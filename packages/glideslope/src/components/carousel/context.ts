import { inject, provide, readonly, type InjectionKey } from 'vue'
import type { GsCarouselState } from './types'

const key: InjectionKey<GsCarouselState> = Symbol('GsCarousel')

const empty: GsCarouselState = readonly({ items: [], position: 0, setPosition: () => {} })

export function provideCarouselContext(state: GsCarouselState) {
  provide(key, state)
}

/**
 * Reads the nearest `GsCarousel`'s reactive state: its `items`, the active `position`, and
 * `setPosition(index)`. Use it to build carousel parts of your own. Outside a carousel it reports
 * no items.
 *
 * @example
 * ```ts
 * const carousel = useCarousel()
 * const current = computed(() => carousel.items[carousel.position])
 * const first = () => carousel.setPosition(0)
 * ```
 */
export function useCarousel(): GsCarouselState {
  return inject(key, empty)
}
