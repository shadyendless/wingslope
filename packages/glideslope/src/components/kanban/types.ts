import type { GsSearchFieldProps } from '../text-field/types'

/** One card of a kanban board. */
export interface GsKanbanCardData {
  /** Unique identifier, across every column. */
  id: string
  /** The card's title. Also names the card for assistive technology and in drag announcements. */
  title: string
  /** The card's body text. */
  body: string
  /** The column the card is in. Kept up to date when the card moves. */
  columnId: string
  /** The card's index in its column. Kept up to date when cards move. */
  position: number
  /** Highlights the card as the current one. `GsKanbanCard`'s `active` prop overrides it. */
  active?: boolean
}

/** One column of a kanban board, with its cards in order. */
export interface GsKanbanColumnData {
  /** Unique identifier. */
  id: string
  /** The column's title, used in drag announcements and the move menu. */
  title: string
  cards: GsKanbanCardData[]
  /** Set to `false` to refuse cards: none can be dropped or moved into the column. */
  canDrop?: boolean
}

/** Where a card sits on the board. */
export interface GsKanbanCardLocation {
  column: GsKanbanColumnData
  card: GsKanbanCardData
  /** The card's index in `column.cards`. */
  index: number
}

/**
 * Moves a card to `targetPosition` in a column. With `closestEdge`, the position is a card's
 * position, and the card goes before (`top`) or after (`bottom`) it. Returns whether the move was
 * valid (see `validateMoveCard`).
 */
export type GsKanbanMoveCard = (
  cardId: string,
  targetColumnId: string,
  targetPosition: number,
  closestEdge?: 'top' | 'bottom',
) => boolean

/** The result of `validateMoveCard`. */
export type GsKanbanMoveValidation =
  | {
      success: true
      /** The target position, clamped to the target column. */
      adjustedPosition: number
      source: GsKanbanCardLocation
      targetColumn: GsKanbanColumnData
      errors: []
    }
  | {
      success: false
      /** Why the move is invalid. */
      errors: string[]
    }

export interface GsKanbanHeaderTitleProps {
  /** The heading level. @default 3 */
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

export type GsKanbanHeaderSearchProps = GsSearchFieldProps

export interface GsKanbanColumnProps {
  /** The column, with the cards it shows. */
  column: GsKanbanColumnData
}

export interface GsKanbanColumnContentProps {
  /**
   * The column whose cards this lists, in the order they are rendered. When the board filters
   * cards, pass the filtered column: cards drop between the cards that are shown.
   */
  column: GsKanbanColumnData
}

export interface GsKanbanColumnHeaderActionsProps {
  /** The number shown in the column's badge. @default 0 */
  cardCount?: number
}

export interface GsKanbanCardProps {
  /** The card this renders. */
  card: GsKanbanCardData
  /** Highlights the card as the current one. Defaults to the card's `active` flag. */
  active?: boolean
}

export interface GsKanbanCardMoveMenuProps {
  /** The card the menu moves. */
  card: GsKanbanCardData
}
