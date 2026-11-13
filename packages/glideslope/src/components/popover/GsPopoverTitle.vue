<script setup lang="ts">
/**
 * The heading of a `GsPopover`. It names the panel for assistive technology; without one, the panel
 * is named by the popover's `label`, or else by its trigger.
 */
import { onBeforeUnmount, onMounted, useId, useTemplateRef } from 'vue'
import styles from './styles.module.css'

const { level = 2 } = defineProps<{
  /** Heading level. @default 2 */
  level?: 1 | 2 | 3 | 4 | 5 | 6
}>()

defineSlots<{
  default?: () => unknown
}>()

const id = useId()
const heading = useTemplateRef<HTMLElement>('heading')

// Reka labels popover content by its trigger and gives that precedence over our attributes, so
// the title points the panel at itself once it is in the DOM, and hands the name back on unmount.
let panel: Element | null | undefined
let previous: string | null = null
onMounted(() => {
  panel = heading.value?.closest('[role="dialog"]')
  previous = panel?.getAttribute('aria-labelledby') ?? null
  panel?.setAttribute('aria-labelledby', id)
})
onBeforeUnmount(() => {
  if (previous) panel?.setAttribute('aria-labelledby', previous)
  else panel?.removeAttribute('aria-labelledby')
})
</script>

<template>
  <component :is="`h${level}`" :id="id" ref="heading" :class="styles.title"><slot /></component>
</template>
