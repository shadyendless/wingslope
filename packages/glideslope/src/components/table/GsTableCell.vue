<script setup lang="ts" generic="T extends RowData">
/**
 * A data cell (`<td>`). In markup, put its content in the default slot. Given a TanStack `cell`, it
 * renders the column's `cell` renderer and takes the column's size.
 *
 * @example
 * ```vue
 * <GsTableCell>{{ track.callsign }}</GsTableCell>
 * ```
 */
import { FlexRender, type RowData } from '@tanstack/vue-table'
import { computed } from 'vue'
import { injectTableContext, injectTableVariant } from './context'
import styles from './styles.module.css'
import type { GsTableCellProps } from './types'

const { cell } = defineProps<GsTableCellProps<T>>()

defineSlots<{
  /** Cell content. Defaults to the output of the column's `cell` renderer. */
  default?: () => unknown
}>()

const table = injectTableContext()
const variant = injectTableVariant()

const columnId = computed(() => cell?.column.id)
const isNumeral = computed(() => columnId.value === 'numeral')
const hideUntilHover = computed(
  () => isNumeral.value && !(table?.options.value.persistNumerals ?? true),
)
const hidden = computed(() => isNumeral.value && !(table?.options.value.displayNumerals ?? true))
</script>

<template>
  <td
    :class="[
      styles.cell,
      styles[variant],
      {
        [styles.sized ?? '']: cell,
        [styles.hideInRow ?? '']: hideUntilHover,
        [styles.hidden ?? '']: hidden,
      },
    ]"
    :style="cell ? { '--table-column-width': `${cell.column.getSize()}px` } : undefined"
    :data-selected="
      (columnId !== undefined && columnId === table?.columnSelection.value) || undefined
    "
  >
    <slot>
      <FlexRender v-if="cell" :cell="cell" />
    </slot>
  </td>
</template>
