<script setup lang="ts" generic="T extends RowData">
/**
 * @internal The row actions menu of a data-driven table: pin or unpin the row, and move it (or the
 * selected rows it belongs to) up or down. Its button is named by the row number, and stops its
 * clicks from reaching the row, so opening the menu doesn't toggle the row's selection.
 */
import type { Row, RowData } from '@tanstack/vue-table'
import KebabIcon from '@wingbrace/glideslope-icons/kebab'
import { computed } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsMenu from '../menu/GsMenu.vue'
import GsMenuItem from '../menu/GsMenuItem.vue'
import GsMenuSeparator from '../menu/GsMenuSeparator.vue'
import { requireTableContext } from './context'
import type { GsTableFeatures } from './features'
import styles from './styles.module.css'
import { toMenuVariant } from './utils'

const { row } = defineProps<{ row: Row<GsTableFeatures, T> }>()

const table = requireTableContext()
const pinned = computed(() => Boolean(row.getIsPinned()))
</script>

<template>
  <div
    v-if="table.options.value.enableRowActions"
    :class="table.options.value.persistRowKebabMenu ? undefined : styles.hideInRow"
  >
    <GsMenu :variant="toMenuVariant(table.variant.value)">
      <template #trigger>
        <GsButton variant="icon" :aria-label="`Row ${row.index + 1} actions`" @click.stop>
          <GsIcon><KebabIcon /></GsIcon>
        </GsButton>
      </template>
      <GsMenuItem :label="pinned ? 'Unpin' : 'Pin'" @select="row.pin(pinned ? false : 'top')" />
      <GsMenuSeparator />
      <GsMenuItem label="Move Up" :disabled="!row.getCanMoveUp()" @select="row.moveUp()" />
      <GsMenuItem label="Move Down" :disabled="!row.getCanMoveDown()" @select="row.moveDown()" />
    </GsMenu>
  </div>
</template>
