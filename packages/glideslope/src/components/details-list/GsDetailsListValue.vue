<script setup lang="ts">
/** The value (`<dd>`) of a `GsDetailsList` row. */
import { injectDetailsListContext } from './context'

defineSlots<{
  default?: () => unknown
}>()

const context = injectDetailsListContext()
</script>

<template>
  <dd :class="context?.valueClass.value"><slot /></dd>
</template>
