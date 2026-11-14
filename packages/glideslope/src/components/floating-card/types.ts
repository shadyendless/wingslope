import type { Component } from 'vue'

/** A point in the provider's coordinate space, in pixels. */
export interface GsFloatingCardPosition {
  x: number
  y: number
}

/** A card's rendered size, in pixels. */
export interface GsFloatingCardDimensions {
  width: number
  height: number
}

/** The box a card is kept inside while dragging and resizing, in the provider's coordinates. */
export interface GsFloatingCardBounds {
  top: number
  left: number
  right: number
  bottom: number
}

/** Edge or corner a resize gesture pulls from. */
export type GsFloatingCardResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

/** Geometry, title and stacking order of one open card, tracked by its provider. */
export interface GsFloatingCardLayout {
  title: string | undefined
  position: GsFloatingCardPosition
  dimensions: GsFloatingCardDimensions
  zIndex: number
}

/**
 * A header action:
 * - an icon button: `{ icon, label, onClick }`
 * - `'divider'`: a vertical divider between groups of actions
 * - `'pin'`: the built-in pin toggle, which freezes dragging and resizing while pressed
 */
export type GsFloatingCardHeaderAction =
  | {
      /** The icon component, e.g. from `@wingbrace/glideslope-icons`. */
      icon: Component
      /**
       * Accessible name of the button. The button shows only its icon, so without a label screen
       * readers announce it only as "button".
       */
      label?: string
      /** Called when the button is pressed. */
      onClick: () => void
    }
  | 'divider'
  | 'pin'

export interface GsFloatingCardProps {
  /**
   * Identifies the card in its provider: `useFloatingCard()` methods, the `headerActions` factory
   * and the provider's `#icon` slot receive it, and `initialPinned` lists it.
   */
  id: string
  /** Title shown in the header. It also names the card (a dialog); untitled cards are announced as "Floating card". */
  title?: string
  /**
   * Initial size, applied each time the card opens. While it stays open, later changes are
   * ignored, so the user's own resize is never overridden.
   * @default { width: 300, height: 400 }
   */
  initialDimensions?: Readonly<GsFloatingCardDimensions>
  /**
   * Initial position in the provider, applied each time the card opens. While it stays open, later
   * changes are ignored, so the user's own drag is never overridden.
   * @default { x: 100, y: 100 }
   */
  initialPosition?: Readonly<GsFloatingCardPosition>
}

export interface GsFloatingCardProviderProps {
  /**
   * Action buttons in every card's header, before the close button. Pass a function of the card id
   * to give each card its own actions.
   */
  headerActions?:
    | readonly GsFloatingCardHeaderAction[]
    | ((cardId: string) => readonly GsFloatingCardHeaderAction[] | undefined)
  /**
   * Region cards are kept inside while being dragged and resized. `provider` confines them to the
   * provider element; `viewport` lets them move anywhere on screen.
   * @default 'provider'
   */
  bounds?: 'provider' | 'viewport'
  /** Ids of cards that start pinned. Read once, when the provider mounts. */
  initialPinned?: readonly string[]
}

/** What `useFloatingCard()` returns: the open cards and ways to control them. */
export interface GsFloatingCardContext {
  /** Each open card's content element (where its default slot is teleported), by card id. Reactive. */
  readonly cards: Readonly<Record<string, HTMLElement>>
  /**
   * Closes a card. Its `v-model:open` becomes `false`. Closing clears its pin, so it reopens
   * unpinned.
   */
  closeCard: (id: string) => void
  /** Pins or unpins a card. A pinned card can't be dragged or resized. */
  togglePinCard: (id: string) => void
  /** Whether a card is pinned. Reactive, so it can be used in templates and `computed`. */
  isPinned: (id: string) => boolean
}
