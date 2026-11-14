/** Size a card opens at when `initialDimensions` is omitted. */
export const DEFAULT_DIMENSIONS = { width: 300, height: 400 } as const

/** Position a card opens at when `initialPosition` is omitted. */
export const DEFAULT_POSITION = { x: 100, y: 100 } as const

/** Smallest size a card can be resized to. */
export const MIN_DIMENSIONS = { width: 150, height: 100 } as const

/** Pointer travel, in pixels, before a press on the header becomes a drag, so a click never nudges the card. */
export const DRAG_THRESHOLD = 5

/** Stacking order the first card in a provider receives. */
export const BASE_Z_INDEX = 1

/** Accessible name of a card without a title. Ids are often uuids, which read as noise. */
export const UNTITLED_LABEL = 'Floating card'
