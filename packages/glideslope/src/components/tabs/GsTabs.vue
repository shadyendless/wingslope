<script setup lang="ts">
/**
 * Switches between related panels. Bind the selected tab's value with `v-model`. Arrow keys move
 * between tabs; Home and End jump to the first and last. `provideTabsDefaults` sets the style and
 * behavior props for every `GsTabs` below a component.
 *
 * @example
 * ```vue
 * <GsTabs v-model="tab">
 *   <GsTabList aria-label="Track views">
 *     <GsTab value="details">Details</GsTab>
 *     <GsTab value="history">History</GsTab>
 *   </GsTabList>
 *   <GsTabPanel value="details">…</GsTabPanel>
 *   <GsTabPanel value="history">…</GsTabPanel>
 * </GsTabs>
 * ```
 */
import { TabsRoot } from 'reka-ui'
import { computed, watchEffect } from 'vue'
import { provideTabRegistry, provideTabsContext } from './context'
import { injectTabsDefaults, provideTabDefaults } from './defaults'
import styles from './styles.module.css'
import type { GsTabsProps } from './types'

const {
  orientation,
  activationMode,
  align,
  flex = undefined,
  disabled = undefined,
} = defineProps<GsTabsProps>()

/** The selected tab's value. */
const model = defineModel<string | number>()

defineSlots<{
  /** A `GsTabList` and the `GsTabPanel`s. */
  default?: () => unknown
}>()

const defaults = injectTabsDefaults()
const resolvedOrientation = computed(
  () => orientation ?? defaults.value.orientation ?? 'horizontal',
)
const resolvedActivationMode = computed(
  () => activationMode ?? defaults.value.activationMode ?? 'automatic',
)
const resolvedDisabled = computed(() => disabled ?? defaults.value.disabled ?? false)

// Like react-aria, select the first enabled tab when nothing is selected, so a panel always shows.
// A disabled set of tabs still shows its selection, so only the tabs' own state counts here.
const tabs = provideTabRegistry()
watchEffect(() => {
  if (model.value !== undefined) return
  const first = tabs.find((tab) => !tab.disabled())
  if (first) model.value = first.value()
})

provideTabsContext({ disabled: resolvedDisabled })
provideTabDefaults(() => ({
  align: align ?? defaults.value.align ?? 'start',
  flex: flex ?? defaults.value.flex ?? true,
}))
</script>

<template>
  <TabsRoot
    v-model="model"
    :orientation="resolvedOrientation"
    :activation-mode="resolvedActivationMode"
    :class="['group/tabs', styles.tabs]"
  >
    <slot />
  </TabsRoot>
</template>
