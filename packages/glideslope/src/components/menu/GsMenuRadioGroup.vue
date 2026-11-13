<script setup lang="ts">
/** A set of mutually exclusive `GsMenuRadioItem`s. Bind the selected value with `v-model`. */
import type { AcceptableValue } from 'reka-ui'
import { injectMenuContext, menuParts } from './context'

/** The selected value. */
const model = defineModel<AcceptableValue>()

defineSlots<{
  /** `GsMenuRadioItem` items. */
  default?: () => unknown
}>()

const parts = menuParts[injectMenuContext().kind]
</script>

<template>
  <component :is="parts.RadioGroup" v-model="model"><slot /></component>
</template>
