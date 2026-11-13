<script setup lang="ts">
/**
 * A two-column list of label/value pairs, rendered as a `<dl>`.
 *
 * @example
 * ```vue
 * <GsDetailsList align="center">
 *   <GsDetailsListLabel>Callsign</GsDetailsListLabel>
 *   <GsDetailsListValue>RAVEN 21</GsDetailsListValue>
 * </GsDetailsList>
 * ```
 */
import { computed } from 'vue'
import { provideDetailsListContext } from './context'
import styles from './styles.module.css'
import type { GsDetailsListProps } from './types'

const { align = 'justify', classes } = defineProps<GsDetailsListProps>()

defineSlots<{
  /** Alternating `GsDetailsListLabel` and `GsDetailsListValue` elements. */
  default?: () => unknown
}>()

provideDetailsListContext({
  labelClass: computed(() => [styles.label, styles[align], classes?.label]),
  valueClass: computed(() => [styles.value, styles[align], classes?.value]),
})
</script>

<template>
  <dl :class="styles.list"><slot /></dl>
</template>
