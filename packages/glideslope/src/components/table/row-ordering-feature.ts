import {
  assignPrototypeAPIs,
  assignTableAPIs,
  makeStateUpdater,
  type OnChangeFn,
  type Row,
  type RowData,
  type RowSelectionState,
  type Table,
  type TableFeature,
  type TableFeatures,
  type Updater,
} from '@tanstack/vue-table'

/**
 * Manual row order as row ids in display order. Empty means the natural (`data`) order. The table
 * owns applying the order to its data; the feature owns the state and the move semantics.
 */
export type RowOrderingState = string[]

export interface RowOrderingTableState {
  rowOrdering: RowOrderingState
}

export interface RowOrderingTableOptions {
  /** Called when the manual row order changes. */
  onRowOrderingChange?: OnChangeFn<RowOrderingState>
}

export interface RowOrderingTableApis {
  /**
   * Updates the manual row order state. Resets (`setRowOrdering([])`) and bulk reorders go through
   * here.
   */
  setRowOrdering: (updater: Updater<RowOrderingState>) => void
}

export interface RowOrderingRowApis {
  /**
   * Moves this row (or every selected row, when this row is selected) up one place in display
   * order, past the nearest unpinned row.
   */
  moveUp: () => void
  /**
   * Moves this row (or every selected row, when this row is selected) down one place in display
   * order, past the nearest unpinned row.
   */
  moveDown: () => void
  /** Whether an unpinned row exists above to move past. False when this row is pinned. */
  getCanMoveUp: () => boolean
  /** Whether an unpinned row exists below to move past. False when this row is pinned. */
  getCanMoveDown: () => boolean
}

declare module '@tanstack/vue-table' {
  interface Plugins {
    rowOrderingFeature?: TableFeature
  }

  interface TableState_FeatureMap {
    rowOrderingFeature: RowOrderingTableState
  }

  // Merged declarations must repeat the original type parameters.
  /* oxlint-disable @typescript-eslint/no-unused-vars */
  interface TableOptions_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    rowOrderingFeature: RowOrderingTableOptions
  }

  interface Table_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    rowOrderingFeature: RowOrderingTableApis
  }

  interface Row_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    rowOrderingFeature: RowOrderingRowApis
  }
  /* oxlint-enable @typescript-eslint/no-unused-vars */
}

function tableSetRowOrdering<TFeatures extends TableFeatures, TData extends RowData>(
  table: Table<TFeatures, TData>,
  updater: Updater<RowOrderingState>,
) {
  ;(table.options as RowOrderingTableOptions).onRowOrderingChange?.(updater)
}

/** Takes the current base order by id, pulls out the moving rows and reinserts them by the target. */
function tableMoveRows<TFeatures extends TableFeatures, TData extends RowData>(
  table: Table<TFeatures, TData>,
  ids: string[],
  targetId: string,
  position: 'before' | 'after',
) {
  const moving = new Set(ids)
  const remaining = table
    .getCoreRowModel()
    .rows.map(({ id }) => id)
    .filter((id) => !moving.has(id))
  const targetIndex = remaining.indexOf(targetId)
  if (targetIndex === -1) return

  remaining.splice(position === 'before' ? targetIndex : targetIndex + 1, 0, ...ids)
  tableSetRowOrdering(table, remaining)
}

// Structural read: getIsPinned only exists when rowPinningFeature is registered.
function isPinnedRow<TFeatures extends TableFeatures, TData extends RowData>(
  row: Row<TFeatures, TData>,
) {
  return Boolean((row as { getIsPinned?: () => false | 'top' | 'bottom' }).getIsPinned?.())
}

/**
 * The nearest unpinned row scanning outward from `fromIndex`. Pinned rows render in their own
 * regions, so they aren't part of the orderable sequence: moving relative to one shows no change.
 */
function findUnpinnedNeighbor<TFeatures extends TableFeatures, TData extends RowData>(
  rows: Row<TFeatures, TData>[],
  fromIndex: number,
  direction: -1 | 1,
) {
  for (let index = fromIndex + direction; index >= 0 && index < rows.length; index += direction) {
    const candidate = rows[index]
    if (candidate && !isPinnedRow(candidate)) return candidate
  }
  return undefined
}

function rowGetCanMove<TFeatures extends TableFeatures, TData extends RowData>(
  table: Table<TFeatures, TData>,
  row: Row<TFeatures, TData>,
  direction: -1 | 1,
) {
  return (
    !isPinnedRow(row) &&
    findUnpinnedNeighbor(table.getRowModel().rows, row.index, direction) !== undefined
  )
}

/** Every selected row when the acted-on row is selected, otherwise just that row. */
function getRowsToMove<TFeatures extends TableFeatures, TData extends RowData>(
  table: Table<TFeatures, TData>,
  row: Row<TFeatures, TData>,
) {
  const rows = table.getRowModel().rows
  // Structural read: rowSelection only exists when rowSelectionFeature is registered.
  const selection =
    (table.atoms as { rowSelection?: { get: () => RowSelectionState } }).rowSelection?.get() ?? {}
  const rowsToMove = selection[row.id] ? rows.filter(({ id }) => selection[id]) : [row]
  return { rows, rowsToMove }
}

function tableMoveRowsBy<TFeatures extends TableFeatures, TData extends RowData>(
  table: Table<TFeatures, TData>,
  row: Row<TFeatures, TData>,
  direction: -1 | 1,
) {
  // Pinned rows render in their own region; moving one shows no change.
  if (isPinnedRow(row)) return

  const { rows, rowsToMove } = getRowsToMove(table, row)
  const edge = direction === -1 ? rowsToMove[0] : rowsToMove[rowsToMove.length - 1]
  if (!edge) return

  const target = findUnpinnedNeighbor(rows, edge.index, direction)
  if (!target) return

  tableMoveRows(
    table,
    rowsToMove.map(({ id }) => id),
    target.id,
    direction === -1 ? 'before' : 'after',
  )
}

/**
 * TanStack Table custom feature for manual row ordering: a `rowOrdering` state slice (row ids in
 * display order), a `table.setRowOrdering` setter, and `row.moveUp()` / `row.moveDown()` with
 * `row.getCanMoveUp()` / `row.getCanMoveDown()`. Moves skip pinned rows.
 *
 * Feature APIs have stable identities, so column definitions can call them without capturing
 * component state.
 */
export const rowOrderingFeature: TableFeature = {
  getInitialState: (initialState) => ({
    ...initialState,
    rowOrdering: (initialState as Partial<RowOrderingTableState>).rowOrdering ?? [],
  }),
  getDefaultTableOptions: (table) => ({
    onRowOrderingChange: makeStateUpdater('rowOrdering', table),
  }),
  constructTableAPIs: <TFeatures extends TableFeatures, TData extends RowData>(
    table: Table<TFeatures, TData>,
  ) => {
    assignTableAPIs('rowOrderingFeature', table, {
      // assignTableAPIs derives the method name from the `table_` prefix.
      table_setRowOrdering: {
        fn: (updater: Updater<RowOrderingState>) => tableSetRowOrdering(table, updater),
      },
    })
  },
  assignRowPrototype: <TFeatures extends TableFeatures, TData extends RowData>(
    prototype: Record<string, unknown>,
    table: Table<TFeatures, TData>,
  ) => {
    // assignPrototypeAPIs derives the method names from the `row_` prefix.
    assignPrototypeAPIs('rowOrderingFeature', prototype, table, {
      row_moveUp: { fn: (row: Row<TFeatures, TData>) => tableMoveRowsBy(table, row, -1) },
      row_moveDown: { fn: (row: Row<TFeatures, TData>) => tableMoveRowsBy(table, row, 1) },
      row_getCanMoveUp: { fn: (row: Row<TFeatures, TData>) => rowGetCanMove(table, row, -1) },
      row_getCanMoveDown: { fn: (row: Row<TFeatures, TData>) => rowGetCanMove(table, row, 1) },
    })
  },
}
