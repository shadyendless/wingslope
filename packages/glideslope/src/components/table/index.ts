export { provideTableDefaults } from './defaults'
export { createTableColumnHelper, tableFeatures, type GsTableFeatures } from './features'
export { default as GsTable } from './GsTable.vue'
export { default as GsTableBody } from './GsTableBody.vue'
export { default as GsTableCell } from './GsTableCell.vue'
export { default as GsTableHeader } from './GsTableHeader.vue'
export { default as GsTableHeaderCell } from './GsTableHeaderCell.vue'
export { default as GsTableRow } from './GsTableRow.vue'
export {
  rowOrderingFeature,
  type RowOrderingRowApis,
  type RowOrderingState,
  type RowOrderingTableApis,
  type RowOrderingTableOptions,
  type RowOrderingTableState,
} from './row-ordering-feature'
export type {
  GsTableBodyProps,
  GsTableCellProps,
  GsTableCellSlotProps,
  GsTableColumnDef,
  GsTableDefaults,
  GsTableHeaderCellProps,
  GsTableHeaderProps,
  GsTableHeaderSlotProps,
  GsTableKebabPosition,
  GsTableMetaColumnId,
  GsTableProps,
  GsTableRowData,
  GsTableRowProps,
  GsTableVariant,
} from './types'
