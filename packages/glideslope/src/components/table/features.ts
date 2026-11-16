import {
  columnOrderingFeature,
  columnSizingFeature,
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  tableFeatures as createTableFeatures,
  rowPaginationFeature,
  rowPinningFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_alphanumericCaseSensitive,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  sortFn_textCaseSensitive,
  type BuiltInSortFn,
  type ColumnHelper,
  type CreatedSortFn,
  type RowData,
  type StockFeatures,
  type TableFeature,
  type TableFeatures,
} from '@tanstack/vue-table'
import { rowOrderingFeature } from './row-ordering-feature'

/**
 * The TanStack Table feature set of every `GsTable`. Pass it as the first type argument of
 * TanStack types (`ColumnDef<GsTableFeatures, Person, string>`, `CellContext`, …) when typing
 * columns by hand; `createTableColumnHelper` does this for you.
 */
export type GsTableFeatures = Pick<
  StockFeatures,
  | 'rowSortingFeature'
  | 'rowSelectionFeature'
  | 'rowPinningFeature'
  | 'rowPaginationFeature'
  | 'columnOrderingFeature'
  | 'columnSizingFeature'
> & {
  rowOrderingFeature: TableFeature
  sortedRowModel: NonNullable<TableFeatures['sortedRowModel']>
  paginatedRowModel: NonNullable<TableFeatures['paginatedRowModel']>
  // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- TanStack's own sortFn registry type
  sortFns: Record<BuiltInSortFn, CreatedSortFn<any, any>>
}

/**
 * The TanStack Table feature set registered for every `GsTable`: sorting, selection, row pinning,
 * pagination, manual row ordering, column ordering and column sizing, with the built-in sorting
 * functions so a column's `sortFn` can name one.
 */
export const tableFeatures: GsTableFeatures = createTableFeatures({
  rowSortingFeature,
  rowSelectionFeature,
  rowPinningFeature,
  rowPaginationFeature,
  rowOrderingFeature,
  columnOrderingFeature,
  columnSizingFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    alphanumericCaseSensitive: sortFn_alphanumericCaseSensitive,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
    textCaseSensitive: sortFn_textCaseSensitive,
  },
})

/**
 * A TanStack column helper bound to `GsTable`'s feature set. Use it in place of TanStack's
 * `createColumnHelper`, which needs the feature set as a second type argument.
 *
 * @example
 * ```ts
 * const columnHelper = createTableColumnHelper<Person>()
 * const columns = [columnHelper.accessor('firstName', { header: 'First Name' })]
 * ```
 */
export function createTableColumnHelper<TData extends RowData>(): ColumnHelper<
  GsTableFeatures,
  TData
> {
  return createColumnHelper<GsTableFeatures, TData>()
}
