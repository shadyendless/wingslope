<script setup lang="ts" generic="T extends RowData">
/**
 * The header section (`<thead>`) of a `GsTable` written in markup. Put a `GsTableRow` of
 * `GsTableHeaderCell`s in it, or pass TanStack `header-groups` to render one row per group.
 *
 * @example
 * ```vue
 * <GsTableHeader>
 *   <GsTableRow>
 *     <GsTableHeaderCell>Callsign</GsTableHeaderCell>
 *   </GsTableRow>
 * </GsTableHeader>
 * ```
 */
import type { RowData } from '@tanstack/vue-table'
import GsTableHeaderCell from './GsTableHeaderCell.vue'
import type { GsTableHeaderProps } from './types'

const { headerGroups } = defineProps<GsTableHeaderProps<T>>()

defineSlots<{
  /** Header rows. Defaults to a row of header cells per `header-groups` entry. */
  default?: () => unknown
}>()
</script>

<template>
  <thead>
    <slot>
      <tr v-for="group in headerGroups" :key="group.id">
        <GsTableHeaderCell v-for="header in group.headers" :key="header.id" :header="header" />
      </tr>
    </slot>
  </thead>
</template>
