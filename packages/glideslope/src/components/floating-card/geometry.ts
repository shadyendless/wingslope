import { MIN_DIMENSIONS } from './constants'
import type {
  GsFloatingCardBounds,
  GsFloatingCardDimensions,
  GsFloatingCardPosition,
  GsFloatingCardResizeHandle,
} from './types'

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Clamps a position so the card stays fully inside its bounds. A card larger than its bounds has
 * no valid range, so it rests against the top-left corner.
 */
export function constrainPosition(
  position: GsFloatingCardPosition,
  dimensions: GsFloatingCardDimensions,
  bounds: GsFloatingCardBounds,
): GsFloatingCardPosition {
  const maxX = Math.max(bounds.left, bounds.right - dimensions.width)
  const maxY = Math.max(bounds.top, bounds.bottom - dimensions.height)
  return {
    x: clamp(position.x, bounds.left, maxX),
    y: clamp(position.y, bounds.top, maxY),
  }
}

/** The geometry a resize gesture starts from. */
export interface ResizeStart {
  handle: GsFloatingCardResizeHandle
  origin: GsFloatingCardPosition
  size: GsFloatingCardDimensions
  bounds: GsFloatingCardBounds
}

/**
 * The card's geometry after pulling `handle` by (`deltaX`, `deltaY`).
 *
 * North and west handles move the origin as well as the size, so the opposite edge stays put. The
 * result never shrinks below `MIN_DIMENSIONS` or grows outside the bounds. A card that already
 * extends past its bounds stays resizable: the limit never falls below the size the gesture
 * started at, so the first move doesn't snap it inward.
 */
export function resizeGeometry(
  { handle, origin, size, bounds }: ResizeStart,
  deltaX: number,
  deltaY: number,
): { dimensions: GsFloatingCardDimensions; position: GsFloatingCardPosition } {
  let { x, y } = origin
  let { width, height } = size

  if (handle.includes('e')) {
    const limit = Math.max(bounds.right - origin.x, size.width)
    width = Math.min(size.width + deltaX, limit)
  }

  if (handle.includes('s')) {
    const limit = Math.max(bounds.bottom - origin.y, size.height)
    height = Math.min(size.height + deltaY, limit)
  }

  if (handle.includes('w')) {
    // Clamping x first keeps the right edge fixed while honouring the bounds.
    const right = origin.x + size.width
    const limit = Math.min(bounds.left, origin.x)
    x = clamp(origin.x + deltaX, limit, right - MIN_DIMENSIONS.width)
    width = right - x
  }

  if (handle.includes('n')) {
    const bottom = origin.y + size.height
    const limit = Math.min(bounds.top, origin.y)
    y = clamp(origin.y + deltaY, limit, bottom - MIN_DIMENSIONS.height)
    height = bottom - y
  }

  return {
    dimensions: {
      width: Math.max(width, MIN_DIMENSIONS.width),
      height: Math.max(height, MIN_DIMENSIONS.height),
    },
    position: { x, y },
  }
}
