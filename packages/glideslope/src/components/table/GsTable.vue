<script setup lang="ts" generic="T extends GsTableRowData">
/**
 * A data table with sorting, row selection, row pinning, row and column reordering, and
 * pagination, built on TanStack Table.
 *
 * Pass TanStack `columns` (built with `createTableColumnHelper`) and `data`, and the table renders
 * itself: a row number column, an optional selection checkbox column, a row actions menu (pin,
 * move up and down), and a menu in each column header to sort by the column or move it. Its state
 * is bound with `v-model:sort`, `v-model:row-selection`, `v-model:row-pinning`,
 * `v-model:column-order`, `v-model:column-sizing` and `v-model:page`; without a binding, the table
 * keeps it itself, starting from the matching `default-*` prop. Render a column's header or cells
 * with the `#header-<columnId>` and `#cell-<columnId>` slots instead of its renderers.
 *
 * For a table without any of that, leave out `columns` and write it in markup with
 * `GsTableHeader`, `GsTableBody`, `GsTableRow`, `GsTableHeaderCell` and `GsTableCell`.
 *
 * @example
 * ```vue
 * <GsTable v-model:row-selection="selected" :columns="columns" :data="people" show-checkbox>
 *   <template #cell-lastName="{ value }"><i>{{ value }}</i></template>
 * </GsTable>
 * ```
 */
import {
  useTable,
  type ColumnOrderState,
  type ColumnSizingState,
  type PaginationState,
  type RowPinningState,
  type RowSelectionState,
  type SortingState,
  type Updater,
} from '@tanstack/vue-table'
import PinIcon from '@wingbrace/glideslope-icons/pin'
import { computed, h, ref, type Component } from 'vue'
import GsCheckbox from '../checkbox/GsCheckbox.vue'
import GsIcon from '../icon/GsIcon.vue'
import { provideTableContext } from './context'
import { injectTableDefaults } from './defaults'
import { tableFeatures, type GsTableFeatures } from './features'
import GsTableBody from './GsTableBody.vue'
import GsTableCell from './GsTableCell.vue'
import GsTableHeader from './GsTableHeader.vue'
import GsTableHeaderCell from './GsTableHeaderCell.vue'
import GsTableRow from './GsTableRow.vue'
import GsTableRowActions from './GsTableRowActions.vue'
import type { RowOrderingState } from './row-ordering-feature'
import styles from './styles.module.css'
import type {
  GsTableCellSlotProps,
  GsTableColumnDef,
  GsTableHeaderSlotProps,
  GsTableProps,
  GsTableRowData,
} from './types'
import {
  getConsumerColumnIds,
  isMetaColumnId,
  META_COLUMN_WIDTH,
  orderRows,
  resolveUpdater,
} from './utils'

type Props = Record<string, unknown>

const {
  columns,
  data,
  variant,
  showCheckbox = false,
  kebabPosition = 'right',
  persistHeaderKebabMenu = true,
  persistRowKebabMenu = true,
  persistNumerals = false,
  displayNumerals = true,
  enableSorting = true,
  enableColumnReordering = true,
  enableRowActions = true,
  manualSorting = false,
  fullWidth = false,
  pageSize,
} = defineProps<GsTableProps<T>>()

/**
 * Sort as `[{ id, desc }]`, or `[]` when unsorted. The column menus write at most one entry.
 * Without a binding, starts from `default-sort`.
 */
const sort = defineModel<SortingState>('sort', {
  default: (props: Props) => (props.defaultSort as SortingState | undefined) ?? [],
})
/**
 * Selected rows, as an object of selected row ids mapped to `true`. Without a binding, starts from
 * `default-row-selection`.
 */
const rowSelection = defineModel<RowSelectionState>('rowSelection', {
  default: (props: Props) => (props.defaultRowSelection as RowSelectionState | undefined) ?? {},
})
/**
 * Ids of the rows pinned to the top and bottom. Ids not in `data` are skipped, not removed.
 * Without a binding, starts from `default-row-pinning`.
 */
const rowPinning = defineModel<RowPinningState>('rowPinning', {
  default: (props: Props) =>
    (props.defaultRowPinning as RowPinningState | undefined) ?? { top: [], bottom: [] },
})
/**
 * Ids of your columns in display order; the meta columns keep their places. Columns left out
 * follow in `columns` order, and an empty array means `columns` order. Updates list every column.
 * Without a binding, starts from `default-column-order`.
 */
const columnOrder = defineModel<ColumnOrderState>('columnOrder', {
  default: (props: Props) => (props.defaultColumnOrder as ColumnOrderState | undefined) ?? [],
})
/**
 * Column widths in pixels by column id, overriding the columns' `size`. Without a binding, starts
 * from `default-column-sizing`.
 */
const columnSizing = defineModel<ColumnSizingState>('columnSizing', {
  default: (props: Props) => (props.defaultColumnSizing as ColumnSizingState | undefined) ?? {},
})
/** Current page (1-based), with `page-size`. Without a binding, starts from `default-page`. */
const page = defineModel<number>('page', {
  default: (props: Props) => (props.defaultPage as number | undefined) ?? 1,
})

defineSlots<
  {
    /** Without `columns`: the table's `GsTableHeader` and `GsTableBody`, written in markup. */
    default?: () => unknown
  } & {
    /** With `columns`: the header content of the column with that id, in place of its renderer. */
    [name: `header-${string}`]: ((props: GsTableHeaderSlotProps<T>) => unknown) | undefined
  } & {
    /** With `columns`: the content of each cell in the column with that id, in place of its renderer. */
    [name: `cell-${string}`]: ((props: GsTableCellSlotProps<T>) => unknown) | undefined
  }
>()

const defaults = injectTableDefaults()
const resolvedVariant = computed(() => variant ?? defaults.value.variant ?? 'cozy')
const dataDriven = computed(() => columns !== undefined)

// Only the manual row order is state here; row content stays owned by `data`, so updates such as
// polling flow straight through.
const rowOrdering = ref<RowOrderingState>([])
const orderedData = computed(() => orderRows(data ?? [], rowOrdering.value))

// `v-model:column-order` names your columns only. The leading meta columns go first; TanStack
// appends every unlisted column (your remaining columns, then a right-hand kebab) in definition
// order, so the meta columns keep their places.
const tableColumnOrder = computed<ColumnOrderState>(() => [
  'numeral',
  'selection',
  ...(kebabPosition === 'left' ? ['kebab'] : []),
  ...columnOrder.value.filter((id) => !isMetaColumnId(id)),
])

const pagination = computed<PaginationState | undefined>(() =>
  pageSize === undefined ? undefined : { pageIndex: page.value - 1, pageSize },
)

const numeralColumn: GsTableColumnDef<T> = {
  id: 'numeral',
  // Visually empty, but every column header needs a name for screen readers.
  header: () => h('span', { class: styles.visuallyHidden }, 'Row'),
  cell: ({ row }) =>
    row.getIsPinned()
      ? h(GsIcon, { size: 'small', role: 'img', 'aria-label': 'Pinned' }, () => h(PinIcon))
      : h('span', String(row.index + 1)),
  size: META_COLUMN_WIDTH,
}

const stopPropagation = (event: Event) => event.stopPropagation()

const selectionColumn: GsTableColumnDef<T> = {
  id: 'selection',
  header: ({ table }) =>
    h(GsCheckbox, {
      modelValue: table.getIsAllRowsSelected()
        ? true
        : table.getIsSomeRowsSelected()
          ? 'indeterminate'
          : false,
      'onUpdate:modelValue': (value: boolean | 'indeterminate' | undefined) =>
        table.toggleAllRowsSelected(value === true),
      'aria-label': 'Select all rows',
    }),
  cell: ({ row }) =>
    h(GsCheckbox, {
      modelValue: row.getIsSelected() ? true : row.getIsSomeSelected() ? 'indeterminate' : false,
      // TanStack row methods live on a shared prototype, so keep the receiver.
      'onUpdate:modelValue': (value: boolean | 'indeterminate' | undefined) =>
        row.toggleSelected(value === true),
      // The row toggles its selection on click too.
      onClick: stopPropagation,
      'aria-label': `Select row ${row.index + 1}`,
    }),
  size: META_COLUMN_WIDTH,
}

const kebabColumn: GsTableColumnDef<T> = {
  id: 'kebab',
  header: () => h('span', { class: styles.visuallyHidden }, 'Actions'),
  cell: ({ row }) => h(GsTableRowActions as Component, { row }),
  size: META_COLUMN_WIDTH,
}

const allColumns = computed<GsTableColumnDef<T>[]>(() => [
  numeralColumn,
  ...(showCheckbox ? [selectionColumn] : []),
  ...(kebabPosition === 'left' ? [kebabColumn] : []),
  ...(columns ?? []),
  ...(kebabPosition === 'right' ? [kebabColumn] : []),
])

function update<S>(model: { value: S }) {
  return (updater: Updater<S>) => {
    model.value = resolveUpdater(updater, model.value)
  }
}

const table = useTable<GsTableFeatures, T>({
  features: tableFeatures,
  data: orderedData,
  columns: allColumns,
  state: computed(() => ({
    sorting: sort.value,
    rowSelection: rowSelection.value,
    rowPinning: rowPinning.value,
    rowOrdering: rowOrdering.value,
    columnOrder: tableColumnOrder.value,
    columnSizing: columnSizing.value,
    ...(pagination.value && { pagination: pagination.value }),
  })),
  getRowId: (row) => String(row.id),
  enableSorting: computed(() => enableSorting),
  manualSorting: computed(() => manualSorting),
  enableRowSelection: true,
  enableRowPinning: true,
  // Without `page-size`, the paginated row model passes every row through.
  manualPagination: computed(() => pageSize === undefined),
  onSortingChange: update(sort),
  onRowSelectionChange: update(rowSelection),
  onRowPinningChange: update(rowPinning),
  onRowOrderingChange: update(rowOrdering),
  onColumnOrderChange: update(columnOrder),
  onColumnSizingChange: update(columnSizing),
  onPaginationChange: (updater) => {
    if (!pagination.value) return
    page.value = resolveUpdater(updater, pagination.value).pageIndex + 1
  },
})

const rows = computed(() => [
  ...table.getTopRows(),
  ...table.getCenterRows(),
  ...table.getBottomRows(),
])

provideTableContext({
  variant: resolvedVariant,
  dataDriven,
  options: computed(() => ({
    persistHeaderKebabMenu,
    persistRowKebabMenu,
    persistNumerals,
    displayNumerals,
    enableSorting,
    enableColumnReordering,
    enableRowActions,
  })),
  columnSelection: ref<string | null>(null),
  moveColumn: (columnId, offset) => {
    const ids = getConsumerColumnIds(table)
    const from = ids.indexOf(columnId)
    const to = from + offset
    if (from < 0 || to < 0 || to >= ids.length) return
    ;[ids[from], ids[to]] = [ids[to] as string, ids[from] as string]
    columnOrder.value = ids
  },
  setSort: (columnId, direction) => {
    sort.value = direction ? [{ id: columnId, desc: direction === 'desc' }] : []
  },
})
</script>

<template>
  <table :class="[styles.table, { [styles.fullWidth ?? '']: fullWidth }]">
    <template v-if="dataDriven">
      <GsTableHeader>
        <tr v-for="group in table.getHeaderGroups()" :key="group.id">
          <GsTableHeaderCell v-for="header in group.headers" :key="header.id" :header="header">
            <template v-if="$slots[`header-${header.column.id}`]" #default>
              <slot :name="`header-${header.column.id}`" :header="header" :column="header.column" />
            </template>
          </GsTableHeaderCell>
        </tr>
      </GsTableHeader>
      <GsTableBody>
        <GsTableRow v-for="row in rows" :key="row.id" :row="row">
          <GsTableCell v-for="cell in row.getAllCells()" :key="cell.id" :cell="cell">
            <template v-if="$slots[`cell-${cell.column.id}`]" #default>
              <slot
                :name="`cell-${cell.column.id}`"
                :cell="cell"
                :row="row"
                :column="cell.column"
                :value="cell.getValue()"
              />
            </template>
          </GsTableCell>
        </GsTableRow>
      </GsTableBody>
    </template>
    <slot v-else />
  </table>
</template>
