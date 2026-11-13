<script setup lang="ts">
/**
 * One tab in a `GsTabList`. `align` and `flex` default to the `GsTabs` values; `provideTabDefaults`
 * sets them, and `disabled`, for every tab below a component.
 */
import { TabsTrigger } from 'reka-ui'
import { computed } from 'vue'
import { injectTabsContext, useRegisterTab } from './context'
import { injectTabDefaults } from './defaults'
import styles from './styles.module.css'
import type { GsTabProps } from './types'

const { value, align, flex = undefined, disabled = undefined } = defineProps<GsTabProps>()

defineSlots<{
  /** Tab label, optionally with a `GsIcon`. */
  default?: () => unknown
}>()

const defaults = injectTabDefaults()
const tabs = injectTabsContext()
const resolvedAlign = computed(() => align ?? defaults.value.align ?? 'start')
const resolvedFlex = computed(() => flex ?? defaults.value.flex ?? true)
const ownDisabled = computed(() => disabled ?? defaults.value.disabled ?? false)

useRegisterTab({ value: () => value, disabled: () => ownDisabled.value })
</script>

<template>
  <TabsTrigger
    :value="value"
    :disabled="ownDisabled || tabs.disabled.value"
    :class="[styles.tab, styles[resolvedAlign], { [styles.flex ?? '']: resolvedFlex }]"
  >
    <slot />
  </TabsTrigger>
</template>
