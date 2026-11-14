<script setup lang="ts" generic="T extends RowData">
/**
 * @internal The column menu in a data-driven table's header cell: move the column left or right,
 * and sort by it. Its button shows the sort direction (and the kebab while hovered). While the
 * menu is open, the column is highlighted.
 */
import type { Header, RowData } from '@tanstack/vue-table'
import ArrowDownIcon from '@wingbrace/glideslope-icons/arrow-down'
import ArrowUpIcon from '@wingbrace/glideslope-icons/arrow-up'
import KebabIcon from '@wingbrace/glideslope-icons/kebab'
import { computed, ref, useId, watch } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsMenu from '../menu/GsMenu.vue'
import GsMenuItem from '../menu/GsMenuItem.vue'
import GsMenuSeparator from '../menu/GsMenuSeparator.vue'
import { requireTableContext } from './context'
import type { GsTableFeatures } from './features'
import styles from './styles.module.css'
import { getConsumerColumnIds, toMenuVariant } from './utils'

const { header, labelId } = defineProps<{
  header: Header<GsTableFeatures, T, unknown>
  /** Id of the header's content, which names the menu button along with its own label. */
  labelId: string
}>()

const table = requireTableContext()
const buttonId = useId()
const open = ref(false)
const hovered = ref(false)

const columnId = computed(() => header.column.id)
const sorted = computed(() => header.column.getIsSorted())
const options = computed(() => table.options.value)

// Meta columns never move, so the edges are your first and last columns rather than TanStack's.
const consumerColumnIds = computed(() => getConsumerColumnIds(header.column.table))
const isFirst = computed(() => consumerColumnIds.value[0] === columnId.value)
const isLast = computed(() => consumerColumnIds.value.at(-1) === columnId.value)

watch(open, (isOpen) => {
  if (isOpen) table.columnSelection.value = columnId.value
  else if (table.columnSelection.value === columnId.value) table.columnSelection.value = null
})
</script>

<template>
  <div :class="options.persistHeaderKebabMenu ? undefined : styles.hideInHeader">
    <GsMenu v-model:open="open" :variant="toMenuVariant(table.variant.value)">
      <template #trigger>
        <GsButton
          :id="buttonId"
          variant="icon"
          aria-label="column actions"
          :aria-labelledby="`${labelId} ${buttonId}`"
          @pointerenter="hovered = true"
          @pointerleave="hovered = false"
        >
          <GsIcon>
            <KebabIcon v-if="!sorted || hovered" />
            <ArrowDownIcon v-else-if="sorted === 'desc'" />
            <ArrowUpIcon v-else />
          </GsIcon>
        </GsButton>
      </template>
      <template v-if="options.enableColumnReordering">
        <GsMenuItem
          label="Move Column Left"
          :disabled="isFirst"
          @select="table.moveColumn(columnId, -1)"
        />
        <GsMenuItem
          label="Move Column Right"
          :disabled="isLast"
          @select="table.moveColumn(columnId, 1)"
        />
      </template>
      <GsMenuSeparator v-if="options.enableColumnReordering && options.enableSorting" />
      <template v-if="options.enableSorting">
        <GsMenuItem
          label="Sort Ascending"
          :disabled="sorted === 'asc'"
          @select="table.setSort(columnId, 'asc')"
        />
        <GsMenuItem
          label="Sort Descending"
          :disabled="sorted === 'desc'"
          @select="table.setSort(columnId, 'desc')"
        />
        <GsMenuItem
          label="Clear Sort"
          :disabled="!sorted"
          @select="table.setSort(columnId, null)"
        />
      </template>
    </GsMenu>
  </div>
</template>
