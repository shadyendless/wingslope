<script setup lang="ts">
/**
 * @internal Renders the options slot a second time, invisibly, so every `GsOption` can report
 * its label even while the real list is closed (Reka UI only mounts a combobox's items when it
 * opens). Options render nothing in this pass.
 */
import type { AcceptableValue } from 'reka-ui'
import { provideOptionsContext } from './context'

const { register } = defineProps<{
  register: (value: AcceptableValue, label: string) => () => void
}>()

defineSlots<{
  default?: () => unknown
}>()

provideOptionsContext({ kind: 'registry', registerLabel: register })
</script>

<template>
  <div hidden><slot /></div>
</template>
