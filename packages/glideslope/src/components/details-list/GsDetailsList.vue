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
import { injectDetailsListDefaults } from './defaults'
import styles from './styles.module.css'
import type { GsDetailsListProps } from './types'

const { align, classes } = defineProps<GsDetailsListProps>()

defineSlots<{
  /** Alternating `GsDetailsListLabel` and `GsDetailsListValue` elements. */
  default?: () => unknown
}>()

const defaults = injectDetailsListDefaults()
const resolvedAlign = computed(() => align ?? defaults.value.align ?? 'justify')

provideDetailsListContext({
  labelClass: computed(() => [
    styles.label,
    styles[resolvedAlign.value],
    defaults.value.classes?.label,
    classes?.label,
  ]),
  valueClass: computed(() => [
    styles.value,
    styles[resolvedAlign.value],
    defaults.value.classes?.value,
    classes?.value,
  ]),
})
</script>

<template>
  <dl :class="[styles.list, defaults.class]"><slot /></dl>
</template>
