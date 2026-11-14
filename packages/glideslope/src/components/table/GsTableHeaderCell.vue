<script setup lang="ts" generic="T extends RowData">
/**
 * A column header cell (`<th>`). In markup, put the column name in the default slot. Given a
 * TanStack `header`, it renders the column's `header` renderer and takes the column's size; inside
 * a data-driven `GsTable` it also sets `aria-sort` and adds the column menu for sorting and moving
 * the column.
 *
 * @example
 * ```vue
 * <GsTableHeaderCell>Callsign</GsTableHeaderCell>
 * ```
 */
import { FlexRender, type RowData } from '@tanstack/vue-table'
import { computed, useId } from 'vue'
import { injectTableContext, injectTableVariant } from './context'
import GsTableHeaderMenu from './GsTableHeaderMenu.vue'
import styles from './styles.module.css'
import type { GsTableHeaderCellProps } from './types'
import { isMetaColumnId } from './utils'

const { header, classes } = defineProps<GsTableHeaderCellProps<T>>()

defineSlots<{
  /** Header content. Defaults to the output of the column's `header` renderer. */
  default?: () => unknown
}>()

const table = injectTableContext()
const variant = injectTableVariant()
const labelId = useId()

const columnId = computed(() => header?.column.id)
const hidden = computed(
  () => columnId.value === 'numeral' && !(table?.options.value.displayNumerals ?? true),
)

const sorted = computed(() => header?.column.getIsSorted() ?? false)
const ariaSort = computed(() =>
  sorted.value === 'asc' ? 'ascending' : sorted.value === 'desc' ? 'descending' : undefined,
)

const showMenu = computed(() => {
  if (!header || !table?.dataDriven.value || isMetaColumnId(header.column.id)) return false
  const { enableSorting, enableColumnReordering } = table.options.value
  return enableSorting || enableColumnReordering
})
</script>

<template>
  <th
    :aria-sort="ariaSort"
    :class="{ [styles.sized ?? '']: header, [styles.hidden ?? '']: hidden }"
    :style="header ? { '--table-column-width': `${header.getSize()}px` } : undefined"
  >
    <div
      :class="['group/header-cell', styles.headerCell, styles[variant], classes?.content]"
      :data-selected="
        (columnId !== undefined && columnId === table?.columnSelection.value) || undefined
      "
    >
      <span :id="labelId" :class="styles.headerLabel">
        <slot>
          <FlexRender v-if="header" :header="header" />
        </slot>
      </span>
      <GsTableHeaderMenu v-if="header && showMenu" :header="header" :label-id="labelId" />
    </div>
  </th>
</template>
