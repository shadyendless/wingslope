<script setup lang="ts">
/**
 * A selectable item of a `GsSidenav`: a toggle button with an icon and a `GsSidenavText` label.
 * Collapsed, only the icon shows, and `text-value` appears as a tooltip. Bind the selected state
 * with `v-model`.
 *
 * @example
 * ```vue
 * <GsSidenavItem v-model="onMap" text-value="Map">
 *   <GsIcon><MapIcon /></GsIcon>
 *   <GsSidenavText>Map</GsSidenavText>
 * </GsSidenavItem>
 * ```
 */
import { Toggle } from 'reka-ui'
import { computed } from 'vue'
import { provideIconDefaults } from '../icon/defaults'
import GsTooltip from '../tooltip/GsTooltip.vue'
import { injectSidenavContext, provideSidenavParts } from './context'
import styles from './styles.module.css'
import type { GsSidenavItemProps } from './types'

// Attributes go to the button, not to the tooltip wrapping it.
defineOptions({ inheritAttrs: false })

const { textValue, disabled = false, classes } = defineProps<GsSidenavItemProps>()

/** Whether the item is selected. Works uncontrolled too. */
const selected = defineModel<boolean>({ default: false })

defineSlots<{
  /** A `GsIcon` and a `GsSidenavText` label, or a `GsSidenavAvatar`. */
  default?: () => unknown
}>()

const sidenav = injectSidenavContext()
const tooltipDisabled = computed(() => !textValue || (sidenav?.open.value ?? false))
const tooltipClasses = computed(() => ({
  content: [styles.tooltip, disabled && styles.tooltipDisabled].filter(Boolean).join(' '),
}))

provideIconDefaults(() => ({ size: 'medium', class: classes?.icon }))
provideSidenavParts(() => ({ text: [styles.text, styles.transient], interactive: true }))
</script>

<template>
  <GsTooltip side="right" :disabled="tooltipDisabled" :classes="tooltipClasses">
    <template #trigger>
      <Toggle
        v-model="selected"
        :disabled="disabled"
        :class="['group/item', styles.item, classes?.button]"
        v-bind="$attrs"
      >
        <slot />
      </Toggle>
    </template>
    {{ textValue }}
  </GsTooltip>
</template>
