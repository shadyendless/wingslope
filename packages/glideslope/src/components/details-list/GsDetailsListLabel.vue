<script setup lang="ts">
/** The label (`<dt>`) of a `GsDetailsList` row. */
import { injectDetailsListContext } from './context'

defineSlots<{
  default?: () => unknown
}>()

const context = injectDetailsListContext()
</script>

<template>
  <dt :class="context?.labelClass.value"><slot /></dt>
</template>
