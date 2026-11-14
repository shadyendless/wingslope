<script setup lang="ts" generic="T extends RowData">
/**
 * The body section (`<tbody>`) of a `GsTable` written in markup. Put `GsTableRow`s in it, or pass
 * TanStack `rows` to render them.
 *
 * @example
 * ```vue
 * <GsTableBody>
 *   <GsTableRow v-for="track in tracks" :key="track.id">
 *     <GsTableCell>{{ track.callsign }}</GsTableCell>
 *   </GsTableRow>
 * </GsTableBody>
 * ```
 */
import type { RowData } from '@tanstack/vue-table'
import GsTableRow from './GsTableRow.vue'
import type { GsTableBodyProps } from './types'

const { rows } = defineProps<GsTableBodyProps<T>>()

defineSlots<{
  /** Body rows. Defaults to a `GsTableRow` per `rows` entry. */
  default?: () => unknown
}>()
</script>

<template>
  <tbody>
    <slot>
      <GsTableRow v-for="row in rows" :key="row.id" :row="row" />
    </slot>
  </tbody>
</template>
