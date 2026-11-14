import type {
  Cell,
  Column,
  ColumnDef,
  HeaderGroup,
  Header,
  Row,
  RowData,
  RowPinningState,
  RowSelectionState,
  SortingState,
  ColumnOrderState,
  ColumnSizingState,
} from '@tanstack/vue-table'
import type { GsTableFeatures } from './features'

/**
 * Cell density, one step on the spacing scale each: `cozy` (12px padding), `compact` (8px) and
 * `crammed` (2px, single-line cells).
 */
export type GsTableVariant = 'cozy' | 'compact' | 'crammed'

/** Which side of the row the row actions menu sits on. */
export type GsTableKebabPosition = 'left' | 'right'

/**
 * Ids of the columns `GsTable` adds around yours: row numbers, the selection checkbox and the row
 * actions menu. Don't use them for your own columns.
 */
export type GsTableMetaColumnId = 'numeral' | 'selection' | 'kebab'

/** A row of table data. Each row needs a unique `id`, which becomes its TanStack row id. */
export interface GsTableRowData {
  id: string | number
}

/**
 * A TanStack column definition for `GsTable`. Build them with `createTableColumnHelper<T>()`.
 * Header and cell renderers return text or VNodes (`h()`), or use the table's `#header-<id>` and
 * `#cell-<id>` slots instead.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ColumnDef is invariant in its value type; TanStack's own column helper output is typed with `any` here too.
export type GsTableColumnDef<T extends RowData> = ColumnDef<GsTableFeatures, T, any>

export interface GsTableProps<T extends GsTableRowData> {
  /**
   * Column definitions, built with `createTableColumnHelper<T>()`. With `data`, the table renders
   * itself from them. Leave both out to write the table in markup with `GsTableHeader`,
   * `GsTableBody`, `GsTableRow`, `GsTableHeaderCell` and `GsTableCell`.
   */
  columns?: GsTableColumnDef<T>[]
  /** Rows to render, each with a unique `id`. Replace the array to update the table. */
  data?: T[]
  /** Cell density. Defaults to the provided table defaults, then `cozy`. */
  variant?: GsTableVariant
  /** Add a column of checkboxes that select rows, with a select-all checkbox in its header. */
  showCheckbox?: boolean
  /** Side of the row actions menu. @default 'right' */
  kebabPosition?: GsTableKebabPosition
  /** Always show the column header menus. When false, a menu shows on hover or focus. @default true */
  persistHeaderKebabMenu?: boolean
  /** Always show the row actions menus. When false, a menu shows on row hover or focus. @default true */
  persistRowKebabMenu?: boolean
  /** Always show row numbers. When false, a row's number shows while it's hovered. @default false */
  persistNumerals?: boolean
  /** Show the row number column at all. Takes precedence over `persistNumerals`. @default true */
  displayNumerals?: boolean
  /** Offer Sort Ascending, Sort Descending and Clear Sort in the column header menus. @default true */
  enableSorting?: boolean
  /** Offer Move Column Left and Move Column Right in the column header menus. @default true */
  enableColumnReordering?: boolean
  /** Add the row actions menu (Pin / Unpin, Move Up, Move Down). @default true */
  enableRowActions?: boolean
  /**
   * Sort the data yourself (for example on a server): the table renders `data` in the order given,
   * while `v-model:sort` still drives the header menus and `aria-sort`.
   */
  manualSorting?: boolean
  /** Take the full width with a fixed table layout, so columns keep their `size`. */
  fullWidth?: boolean
  /**
   * Rows per page. Turns on client-side pagination: the table shows one page of `data`, chosen with
   * `v-model:page`. Pair it with a `GsPagination` for navigation.
   */
  pageSize?: number
  /** Sort to start with, without `v-model:sort`. @default [] */
  defaultSort?: SortingState
  /** Selected rows to start with, without `v-model:row-selection`. @default {} */
  defaultRowSelection?: RowSelectionState
  /** Pinned rows to start with, without `v-model:row-pinning`. @default { top: [], bottom: [] } */
  defaultRowPinning?: RowPinningState
  /** Column order to start with, without `v-model:column-order`. @default [] */
  defaultColumnOrder?: ColumnOrderState
  /** Column widths to start with, without `v-model:column-sizing`. @default {} */
  defaultColumnSizing?: ColumnSizingState
  /** Page to start on (1-based), without `v-model:page`. @default 1 */
  defaultPage?: number
}

/** Props of a `GsTable` `#header-<columnId>` slot. */
export interface GsTableHeaderSlotProps<T extends RowData> {
  /** The TanStack header being rendered. */
  header: Header<GsTableFeatures, T, unknown>
  /** Its column. */
  column: Column<GsTableFeatures, T, unknown>
}

/** Props of a `GsTable` `#cell-<columnId>` slot. */
export interface GsTableCellSlotProps<T extends RowData> {
  /** The TanStack cell being rendered. */
  cell: Cell<GsTableFeatures, T, unknown>
  /** Its row, with the row data in `row.original`. */
  row: Row<GsTableFeatures, T>
  /** Its column. */
  column: Column<GsTableFeatures, T, unknown>
  /** The cell's value, from the column's accessor. */
  value: unknown
}

export interface GsTableHeaderProps<T extends RowData> {
  /** TanStack header groups to render as header rows, when the default slot is empty. */
  headerGroups?: HeaderGroup<GsTableFeatures, T>[]
}

export interface GsTableBodyProps<T extends RowData> {
  /** TanStack rows to render, when the default slot is empty. */
  rows?: Row<GsTableFeatures, T>[]
}

export interface GsTableRowProps<T extends RowData> {
  /**
   * The TanStack row this renders. Its cells render when the default slot is empty, and clicking
   * the row toggles its selection.
   */
  row?: Row<GsTableFeatures, T>
}

export interface GsTableHeaderCellProps<T extends RowData> {
  /**
   * The TanStack header this renders. Its content renders when the default slot is empty; inside a
   * data-driven `GsTable`, it also gets the column menu and `aria-sort`.
   */
  header?: Header<GsTableFeatures, T, unknown>
  /**
   * Classes for inner parts (`class` goes on the `<th>`):
   * - `content`: the box inside the cell that holds the content and the column menu
   */
  classes?: { content?: string }
}

export interface GsTableCellProps<T extends RowData> {
  /** The TanStack cell this renders, when the default slot is empty. */
  cell?: Cell<GsTableFeatures, T, unknown>
}

/** Defaults a parent can provide to every `GsTable` and hand-composed table part below it. */
export interface GsTableDefaults {
  variant?: GsTableVariant
}
