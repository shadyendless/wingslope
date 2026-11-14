import { inject, provide, type InjectionKey } from 'vue'
import type {
  GsFloatingCardContext,
  GsFloatingCardDimensions,
  GsFloatingCardPosition,
} from './types'

/** What a card registers with its provider when it opens. */
export interface FloatingCardRegistration {
  title: string | undefined
  position: GsFloatingCardPosition
  dimensions: GsFloatingCardDimensions
  /** Called when something other than the card itself closes it (the close button, `closeCard`). */
  onClose: () => void
}

/**
 * How a `GsFloatingCard` attaches itself to its provider. Internal wiring, kept off the value
 * `useFloatingCard()` returns.
 */
export interface FloatingCardRegistry {
  /** Each open card's content element, the card's teleport target. */
  readonly cards: Readonly<Record<string, HTMLElement>>
  /** Opens a card, or updates the title of one that is already open. */
  openCard: (id: string, registration: FloatingCardRegistration) => void
  /** Removes a card the card itself closed, without calling its `onClose`. */
  removeCard: (id: string) => void
}

const contextKey: InjectionKey<GsFloatingCardContext> = Symbol('GsFloatingCardContext')
const registryKey: InjectionKey<FloatingCardRegistry> = Symbol('GsFloatingCardRegistry')

export function provideFloatingCardContext(
  context: GsFloatingCardContext,
  registry: FloatingCardRegistry,
) {
  provide(contextKey, context)
  provide(registryKey, registry)
}

export function injectFloatingCardRegistry(): FloatingCardRegistry {
  const registry = inject(registryKey, null)
  if (!registry) throw new Error('GsFloatingCard must be rendered within a GsFloatingCardProvider.')
  return registry
}

/**
 * Controls the floating cards of the nearest `GsFloatingCardProvider`: close and pin cards by id,
 * and read which are pinned and open. Everything it returns is reactive.
 *
 * @throws If called outside a `GsFloatingCardProvider`.
 *
 * @example
 * ```ts
 * const { closeCard, togglePinCard, isPinned } = useFloatingCard()
 * const pinned = computed(() => isPinned('details'))
 * ```
 */
export function useFloatingCard(): GsFloatingCardContext {
  const context = inject(contextKey, null)
  if (!context) throw new Error('useFloatingCard must be used within a GsFloatingCardProvider.')
  return context
}
