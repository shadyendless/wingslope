/**
 * @internal `GsKanban`'s drag-and-drop on dnd-kit: the `DragDropProvider` setup and what a drop
 * does.
 *
 * Cards are dnd-kit sortables, one group per column, so dnd-kit's optimistic sorting moves the
 * dragged card's element through the lists while it is dragged (it is the drop preview), and its
 * keyboard plugin steps it between cards and columns. Columns are droppables too: a card dropped
 * on a column outside its cards goes to its end, as in the Design Toolkit. An empty column also
 * lists a card-sized droppable slot, which the keyboard plugin can reach (it skips the column's own
 * droppable, which ranks below cards). On drop, the card's final place among the cards shown in
 * its column becomes a `moveCard` relative to its new neighbors, so a filtered board (cards hidden
 * by a search) drops between the cards it shows.
 */
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/vue'
import { isSortable } from '@dnd-kit/vue/sortable'
import { ref, type Ref } from 'vue'
import { withAccessibility } from '../../lib/dnd-accessibility'
import type { KanbanContext } from './context'

const INSTRUCTIONS =
  'To move this card, press Space or Enter. While moving it, use the arrow keys to move it ' +
  'within its column or to another column, then press Space or Enter to drop it, or Escape to ' +
  'cancel.'

type Operation = DragEndEvent['operation']

/** Where a drag puts a card: its column and its place among the cards that column shows. */
interface KanbanDrop {
  columnId: string
  /** The ids of the cards the column shows, in order, with the dragged card in its new place. */
  shown: string[]
  index: number
  /** Whether that differs from where the card started. */
  moved: boolean
}

/** The props and listeners `GsKanban` binds to dnd-kit's `DragDropProvider`. */
export interface KanbanDragProviderBindings {
  plugins: ReturnType<typeof withAccessibility>
  onDragStart: (event: DragStartEvent) => void
  onDragEnd: (event: DragEndEvent) => void
}

export function useKanbanDrag(
  board: Pick<
    KanbanContext,
    'columns' | 'cardMap' | 'getColumnById' | 'moveCard' | 'columnIdOf' | 'shownCards' | 'focusCard'
  >,
): {
  provider: KanbanDragProviderBindings
  activeCardId: Ref<string | null>
  renderKey: Ref<number>
} {
  const activeCardId = ref<string | null>(null)
  const renderKey = ref(0)
  /** Where the dragged card's element was before optimistic sorting moved it. */
  let origin: { element: Element; parent: Node; next: Node | null } | undefined
  let keyboard = false
  /** The card has left where it started: from then on, every place it reaches is announced. */
  let left = false

  const cardTitle = (id: string) => board.cardMap.value.get(id)?.card.title ?? id
  const columnTitle = (id: string) => board.getColumnById(id)?.title ?? id

  function resolveDrop(event: DragOverEvent | DragEndEvent): KanbanDrop | undefined {
    const { source, target } = event.operation
    if (!source) return undefined
    const cardId = String(source.id)
    const from = board.cardMap.value.get(cardId)?.column.id
    const others = (columnId: string) =>
      board.shownCards(columnId).flatMap((card) => (card.id === cardId ? [] : card.id))

    let columnId: string | undefined
    let shown: string[] | undefined
    const overColumn = target ? board.columnIdOf(target.id) : undefined
    if (overColumn !== undefined) {
      // Over a column, outside its cards (or over an empty one): the card goes to its end.
      columnId = overColumn
      shown = [...others(columnId), cardId]
    } else if (isSortable(source)) {
      // Over cards, or nothing: optimistic sorting already put the card's element where the
      // sortable's group and index say, which is where the user sees it.
      columnId = board.columnIdOf(source.sortable.group)
      if (columnId !== undefined) {
        shown = others(columnId)
        shown.splice(Math.min(Math.max(source.sortable.index, 0), shown.length), 0, cardId)
      }
    }
    if (columnId === undefined || !shown) return undefined
    const before = from === undefined ? [] : board.shownCards(from).map((card) => card.id)
    const moved = columnId !== from || shown.join('\n') !== before.join('\n')
    return { columnId, shown, index: shown.indexOf(cardId), moved }
  }

  const describe = ({ columnId, shown, index }: KanbanDrop) =>
    `${columnTitle(columnId)}, position ${index + 1} of ${shown.length}`

  const plugins = withAccessibility({
    screenReaderInstructions: { draggable: INSTRUCTIONS },
    announcements: {
      dragstart: ({ operation }) => {
        if (!operation.source) return undefined
        const id = String(operation.source.id)
        const column = board.cardMap.value.get(id)?.column.id
        const shown = column === undefined ? [] : board.shownCards(column).map((c) => c.id)
        const at =
          column === undefined
            ? ''
            : `, in ${describe({ columnId: column, shown, index: shown.indexOf(id), moved: false })}`
        return `Picked up card ${cardTitle(id)}${at}.`
      },
      dragover: (event) => {
        const { source, target } = event.operation
        // Over another card, the card is about to take its place: announce once it has.
        if (!source || !target || (target.id !== source.id && !board.columnIdOf(target.id))) {
          return undefined
        }
        const drop = resolveDrop(event)
        if (!drop || (!drop.moved && !left)) return undefined
        left = true
        return `Card ${cardTitle(String(source.id))} is in ${describe(drop)}.`
      },
      dragend: (event) => {
        const { source } = event.operation
        if (!source) return undefined
        const title = cardTitle(String(source.id))
        if (event.canceled) return `Moving card ${title} was cancelled.`
        const drop = resolveDrop(event)
        if (!drop?.moved) return `Card ${title} was dropped in its original position.`
        return `Card ${title} dropped in ${describe(drop)}.`
      },
    },
  })

  function onDragStart({ operation }: DragStartEvent) {
    left = false
    activeCardId.value = operation.source ? String(operation.source.id) : null
    const element = operation.source?.element
    origin = element?.parentNode
      ? { element, parent: element.parentNode, next: element.nextSibling }
      : undefined
    keyboard =
      typeof KeyboardEvent !== 'undefined' && operation.activatorEvent instanceof KeyboardEvent
  }

  /**
   * Puts the dragged card's element back where Vue rendered it, so Vue patches the drop from the
   * DOM it expects. Otherwise, when the card was its column's last, Vue unmounts the column's
   * emptied slot fragment by removing what lies between its anchors, and the moved element, no
   * longer between them, stays in its new list beside the copy Vue renders there.
   */
  function restoreOrigin() {
    if (!origin) return
    const { element, parent, next } = origin
    origin = undefined
    if (!parent.isConnected) return
    const anchor = next?.parentNode === parent ? next : null
    if (element.parentNode !== parent || element.nextSibling !== anchor) {
      parent.insertBefore(element, anchor)
    }
  }

  function onDragEnd(event: DragEndEvent) {
    activeCardId.value = null
    const { source } = event.operation
    // dnd-kit puts a cancelled card back itself.
    if (!source || event.canceled) {
      origin = undefined
      return
    }
    // Read the drop before restoring: optimistic sorting's index and group describe where the
    // user saw the card.
    const cardId = String(source.id)
    const drop = resolveDrop(event)
    restoreOrigin()
    const applied = drop?.moved ? apply(cardId, drop) : !domMoved(event.operation)
    // Optimistic sorting moved the card, but the data didn't follow: rebuild the lists so their
    // sortables start again from the data rather than from where the card was dragged.
    if (!applied) renderKey.value++
    if (keyboard) board.focusCard(cardId)
  }

  /** Moves the card between its new neighbors among the cards its column shows. */
  function apply(cardId: string, { columnId, shown, index }: KanbanDrop): boolean {
    const cards = board.getColumnById(columnId)?.cards ?? []
    const position = (id: string) => cards.findIndex((card) => card.id === id)
    const next = shown[index + 1]
    const previous = shown[index - 1]
    if (next !== undefined) return board.moveCard(cardId, columnId, position(next), 'top')
    if (previous !== undefined)
      return board.moveCard(cardId, columnId, position(previous), 'bottom')
    return board.moveCard(cardId, columnId, cards.length)
  }

  function domMoved({ source }: Operation): boolean {
    if (!source || !isSortable(source)) return false
    const { sortable } = source
    return sortable.index !== sortable.initialIndex || sortable.group !== sortable.initialGroup
  }

  return { provider: { plugins, onDragStart, onDragEnd }, activeCardId, renderKey }
}
