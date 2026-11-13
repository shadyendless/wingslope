<script setup lang="ts">
/**
 * The always-visible row of a `GsAccordion`: a `GsAccordionTrigger` plus optional actions such as
 * a menu. Buttons in the header default to the icon variant.
 */
import KebabIcon from '@wingbrace/glideslope-icons/kebab'
import { provideButtonDefaults } from '../button/defaults'
import { provideIconDefaults } from '../icon/defaults'
import { injectAccordionItem } from './context'
import styles from './styles.module.css'

defineSlots<{
  default?: () => unknown
}>()

const item = injectAccordionItem()
provideIconDefaults(() => ({ size: item?.variant.value === 'compact' ? 'small' : 'large' }))
// Like the Design Toolkit's header: action buttons are icon buttons with a kebab icon by default,
// styled as the header's menu and disabled together with the accordion.
provideButtonDefaults(() => ({
  variant: 'icon',
  class: styles.menu,
  icon: KebabIcon,
  disabled: item?.disabled.value,
}))
</script>

<template>
  <div :class="styles.header"><slot /></div>
</template>
