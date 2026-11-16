import {
  inject,
  onBeforeUnmount,
  provide,
  reactive,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from 'vue'
import type {
  GsKanbanCardData,
  GsKanbanCardLocation,
  GsKanbanColumnData,
  GsKanbanMoveCard,
} from './types'

/** The board's state and actions, from `useKanban()` inside a `GsKanban`. */
export interface UseKanban {
  /** The board's columns (`v-model:columns`). */
  columns: ComputedRef<GsKanbanColumnData[]>
  /** Replaces the columns. */
  updateColumns: (columns: GsKanbanColumnData[]) => void
  /**
   * Moves a card, like dropping it. Logs and returns `false` when the move is invalid (see
   * `validateMoveCard`).
   */
  moveCard: GsKanbanMoveCard
  /** Finds a column by id. */
  getColumnById: (id: string) => GsKanbanColumnData | undefined
  /** Every card by id, with its column and index. */
  cardMap: ComputedRef<Map<string, GsKanbanCardLocation>>
  /** The id of the card being dragged, or `null`. */
  activeCardId: Readonly<Ref<string | null>>
}

/** @internal What `GsKanban` shares with its parts, on top of `UseKanban`. */
export interface KanbanContext extends UseKanban {
  /** The dnd-kit id of a column's droppable, which is also its cards' sortable group. */
  dropId: (columnId: string) => string
  /** The dnd-kit id of the droppable slot an empty column lists. */
  slotId: (columnId: string) => string
  /** The column a droppable or sortable group id belongs to. */
  columnIdOf: (dropId: unknown) => string | undefined
  /** Records the cards a column renders, in order (they can be a filtered subset). */
  registerShownCards: (columnId: string, cards: () => readonly GsKanbanCardData[]) => () => void
  /** The cards a column renders, in order. */
  shownCards: (columnId: string) => readonly GsKanbanCardData[]
  /** Records a card's element, to give it the focus after a move. */
  registerCard: (id: string, element: HTMLElement) => () => void
  /** Focuses a card once the board has re-rendered. */
  focusCard: (id: string) => void
  /** Bumped to rebuild the card lists when a drop left the DOM out of step with the data. */
  renderKey: Ref<number>
}

const key: InjectionKey<KanbanContext> = Symbol('GsKanban')

export function provideKanbanContext(context: KanbanContext) {
  provide(key, context)
}

export function injectKanbanContext(component: string): KanbanContext {
  const context = inject(key, undefined)
  if (!context) throw new Error(`${component} must be inside a GsKanban`)
  return context
}

/**
 * The state and actions of the `GsKanban` around the calling component: its columns, `moveCard`,
 * `getColumnById`, the card map and the card being dragged. Throws outside a `GsKanban`.
 *
 * @example
 * ```ts
 * const { moveCard, getColumnById } = useKanban()
 * const archive = (cardId: string) =>
 *   moveCard(cardId, 'done', getColumnById('done')?.cards.length ?? 0)
 * ```
 */
export function useKanban(): UseKanban {
  const { columns, updateColumns, moveCard, getColumnById, cardMap, activeCardId } =
    injectKanbanContext('useKanban')
  return { columns, updateColumns, moveCard, getColumnById, cardMap, activeCardId }
}

/** @internal The cards a `GsKanbanColumnContent` lists, for its cards' sortable index. */
const contentKey: InjectionKey<ComputedRef<GsKanbanColumnData>> = Symbol('GsKanbanColumnContent')

export function provideKanbanContent(column: ComputedRef<GsKanbanColumnData>) {
  provide(contentKey, column)
}

export function injectKanbanContent(): ComputedRef<GsKanbanColumnData> | undefined {
  return inject(contentKey, undefined)
}

const columnTitleKey: InjectionKey<string[]> = Symbol('GsKanbanColumnTitle')

/** @internal The ids of a column's `GsKanbanColumnHeaderTitle`s, which name the column. */
export function provideKanbanColumnTitles(): string[] {
  const ids = reactive<string[]>([])
  provide(columnTitleKey, ids)
  return ids
}

/** Adds a title's id to its column's name. */
export function useKanbanColumnTitle(id: string) {
  const ids = inject(columnTitleKey, undefined)
  if (!ids) return
  ids.push(id)
  onBeforeUnmount(() => {
    const index = ids.indexOf(id)
    if (index !== -1) ids.splice(index, 1)
  })
}
