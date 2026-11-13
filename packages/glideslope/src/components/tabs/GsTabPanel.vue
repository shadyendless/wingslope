<script setup lang="ts">
/** The content shown while its `GsTab` is selected. */
import { TabsContent } from 'reka-ui'
import styles from './styles.module.css'
import type { GsTabPanelProps } from './types'

const { value } = defineProps<GsTabPanelProps>()

defineSlots<{
  default?: () => unknown
}>()
</script>

<template>
  <TabsContent :value="value" :class="styles.panel"><slot /></TabsContent>
</template>
