/**
 * Pure helpers for kanban board data. They never mutate their input: `moveKanbanCard` returns new
 * column and card objects for what changed and shares the rest.
 */
import type { GsKanbanCardLocation, GsKanbanColumnData, GsKanbanMoveValidation } from './types'

/** Every card by id, with its column and index. */
export function getKanbanCardMap(
  columns: readonly GsKanbanColumnData[],
): Map<string, GsKanbanCardLocation> {
  const map = new Map<string, GsKanbanCardLocation>()
  for (const column of columns) {
    column.cards.forEach((card, index) => map.set(card.id, { column, card, index }))
  }
  return map
}

/**
 * The index a card goes to: `targetPosition` itself, or after it for the `bottom` edge of the card
 * at that position.
 */
export function getInsertIndex(targetPosition: number, closestEdge?: 'top' | 'bottom'): number {
  return closestEdge === 'bottom' ? targetPosition + 1 : targetPosition
}

/**
 * Checks a card move. A move is invalid for an unknown card or column, a non-finite position or a
 * column with `canDrop: false`. A position outside the column is clamped to it, with a warning.
 */
export function validateMoveCard(
  columns: readonly GsKanbanColumnData[],
  cardId: string,
  targetColumnId: string,
  targetPosition: number,
): GsKanbanMoveValidation {
  const errors: string[] = []
  if (typeof cardId !== 'string' || !cardId.trim()) {
    errors.push('[GsKanban] moveCard: cardId must be a non-empty string')
  }
  if (typeof targetColumnId !== 'string' || !targetColumnId.trim()) {
    errors.push('[GsKanban] moveCard: targetColumnId must be a non-empty string')
  }
  if (typeof targetPosition !== 'number' || !Number.isFinite(targetPosition)) {
    errors.push('[GsKanban] moveCard: targetPosition must be a finite number')
  }
  if (errors.length > 0) return { success: false, errors }

  const source = getKanbanCardMap(columns).get(cardId)
  if (!source) {
    return { success: false, errors: [`[GsKanban] moveCard: Card "${cardId}" not found`] }
  }
  const targetColumn = columns.find((column) => column.id === targetColumnId)
  if (!targetColumn) {
    return {
      success: false,
      errors: [`[GsKanban] moveCard: Target column "${targetColumnId}" not found`],
    }
  }
  if (targetColumn.canDrop === false) {
    return {
      success: false,
      errors: [`[GsKanban] moveCard: Column "${targetColumnId}" does not accept drops`],
    }
  }

  let adjustedPosition = targetPosition
  if (adjustedPosition < 0) {
    console.warn(`[GsKanban] moveCard: targetPosition (${adjustedPosition}) is negative; using 0`)
    adjustedPosition = 0
  }
  const max = targetColumn.cards.length
  if (adjustedPosition > max) {
    console.warn(
      `[GsKanban] moveCard: targetPosition (${adjustedPosition}) exceeds ${max}; using ${max}`,
    )
    adjustedPosition = max
  }
  return { success: true, adjustedPosition, source, targetColumn, errors: [] }
}

/**
 * Moves a card to `targetPosition` in a column (before or after the card there with
 * `closestEdge`), and renumbers the `position` of the cards in the columns it leaves and joins.
 * Returns the new columns, or `undefined` when the move is invalid (see `validateMoveCard`).
 *
 * @example
 * ```ts
 * // Move a card to the top of the "done" column.
 * const next = moveKanbanCard(columns.value, 'card-1', 'done', 0)
 * if (next) columns.value = next
 * ```
 */
export function moveKanbanCard(
  columns: readonly GsKanbanColumnData[],
  cardId: string,
  targetColumnId: string,
  targetPosition: number,
  closestEdge?: 'top' | 'bottom',
): GsKanbanColumnData[] | undefined {
  const validation = validateMoveCard(columns, cardId, targetColumnId, targetPosition)
  if (!validation.success) return undefined
  const { source, targetColumn, adjustedPosition } = validation
  const sameColumn = source.column.id === targetColumn.id

  let index = getInsertIndex(adjustedPosition, closestEdge)
  // The card leaves its column first, which shifts later positions up by one.
  if (sameColumn && source.index < index) index -= 1

  const remaining = source.column.cards.filter((card) => card.id !== cardId)
  const joined = sameColumn ? remaining : [...targetColumn.cards]
  joined.splice(Math.min(index, joined.length), 0, { ...source.card, columnId: targetColumn.id })

  const renumber = (column: GsKanbanColumnData, cards: GsKanbanColumnData['cards']) => ({
    ...column,
    cards: cards.map((card, position) =>
      card.position === position ? card : { ...card, position },
    ),
  })
  return columns.map((column) => {
    if (column.id === targetColumn.id) return renumber(column, joined)
    if (column.id === source.column.id) return renumber(column, remaining)
    return column
  })
}
