import { reactive } from 'vue'
import { BASE_Z_INDEX } from './constants'
import type {
  GsFloatingCardDimensions,
  GsFloatingCardLayout,
  GsFloatingCardPosition,
} from './types'

/**
 * Tracks the position, size and stacking order of the cards in one provider. The state is per
 * provider, so two providers on a page keep independent stacking orders.
 */
export function useCardLayout() {
  const layouts = reactive<Record<string, GsFloatingCardLayout>>({})

  function highestZIndex(): number {
    return Object.values(layouts).reduce(
      (max, layout) => Math.max(max, layout.zIndex),
      BASE_Z_INDEX - 1,
    )
  }

  /** Adds a card on top of the others. An open card keeps its geometry; only its title is updated. */
  function register(
    id: string,
    title: string | undefined,
    position: GsFloatingCardPosition,
    dimensions: GsFloatingCardDimensions,
  ) {
    const existing = layouts[id]
    if (existing) {
      existing.title = title
      return
    }
    layouts[id] = {
      title,
      position: { ...position },
      dimensions: { ...dimensions },
      zIndex: highestZIndex() + 1,
    }
  }

  function unregister(id: string) {
    delete layouts[id]
  }

  function move(id: string, position: GsFloatingCardPosition) {
    const layout = layouts[id]
    if (layout) layout.position = position
  }

  function resize(
    id: string,
    dimensions: GsFloatingCardDimensions,
    position: GsFloatingCardPosition,
  ) {
    const layout = layouts[id]
    if (!layout) return
    layout.dimensions = dimensions
    layout.position = position
  }

  /**
   * Raises a card above its siblings. The cards are renumbered from the bottom rather than the
   * raised one climbing past the previous top, so alternating between two cards never grows the
   * values without limit and eventually paints over application chrome.
   */
  function bringToFront(id: string) {
    const target = layouts[id]
    if (!target || target.zIndex === highestZIndex()) return

    const others = Object.entries(layouts)
      .filter(([cardId]) => cardId !== id)
      .sort(([, a], [, b]) => a.zIndex - b.zIndex)
    others.forEach(([, layout], index) => {
      layout.zIndex = BASE_Z_INDEX + index
    })
    target.zIndex = BASE_Z_INDEX + others.length
  }

  return { layouts, register, unregister, move, resize, bringToFront }
}
