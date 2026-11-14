<script setup lang="ts" generic="T extends RowData">
/**
 * A table row (`<tr>`). In markup, fill it with `GsTableHeaderCell`s or `GsTableCell`s. Given a
 * TanStack `row`, it renders the row's cells, reflects its selection and pinning
 * (`data-selected`, `data-pinned`), and toggles its selection when clicked.
 *
 * @example
 * ```vue
 * <GsTableRow>
 *   <GsTableCell>AF1</GsTableCell>
 * </GsTableRow>
 * ```
 */
import type { RowData } from '@tanstack/vue-table'
import GsTableCell from './GsTableCell.vue'
import styles from './styles.module.css'
import type { GsTableRowProps } from './types'

const { row } = defineProps<GsTableRowProps<T>>()

const emit = defineEmits<{
  /**
   * The row was clicked. Runs before a row with a `row` toggles its selection; call
   * `event.preventDefault()` to keep the selection as it is.
   */
  click: [event: MouseEvent]
}>()

defineSlots<{
  /** The row's cells. Defaults to a `GsTableCell` per cell of `row`. */
  default?: () => unknown
}>()

function onClick(event: MouseEvent) {
  emit('click', event)
  if (!event.defaultPrevented) row?.toggleSelected()
}
</script>

<template>
  <tr
    :class="['group/row', styles.row]"
    :data-pinned="row?.getIsPinned() || undefined"
    :data-selected="row?.getIsSelected() || undefined"
    @click="onClick"
  >
    <slot>
      <GsTableCell v-for="cell in row?.getAllCells()" :key="cell.id" :cell="cell" />
    </slot>
  </tr>
</template>
