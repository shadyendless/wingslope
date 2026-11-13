<script setup lang="ts">
/** Groups related menu items under an optional heading: the `title` prop, or the `title` slot. */
import { injectMenuContext, menuParts } from './context'
import styles from './styles.module.css'
import type { GsMenuSectionProps } from './types'

const { title, classes } = defineProps<GsMenuSectionProps>()

const slots = defineSlots<{
  /** A custom heading in place of `title`, such as a title with a subtitle. */
  title?: () => unknown
  /** Menu items. */
  default?: () => unknown
}>()

const parts = menuParts[injectMenuContext().kind]
</script>

<template>
  <component :is="parts.Group">
    <component
      :is="parts.Label"
      v-if="title || slots.title"
      :class="[styles.header, classes?.header]"
    >
      <slot name="title">{{ title }}</slot>
    </component>
    <slot />
  </component>
</template>
