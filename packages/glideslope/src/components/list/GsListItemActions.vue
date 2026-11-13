<script setup lang="ts">
/**
 * @internal Holds a `GsListItem`'s `#actions` slot. Like Reka's own `TagGroupItemDelete`, it keeps
 * clicks and key presses on the controls from reaching the row (so opening a menu doesn't toggle
 * selection), and only lets Tab reach them in the row that is the list's current tab stop.
 */
import { injectTagGroupItemContext } from 'reka-ui'
import { useTemplateRef } from 'vue'
import { useRowTabStop } from '../../lib/use-row-tab-stop'
import styles from './styles.module.css'

defineSlots<{
  default?: () => unknown
}>()

const item = injectTagGroupItemContext()
useRowTabStop(useTemplateRef<HTMLElement>('root'), item.isTabStop)
</script>

<template>
  <div ref="root" :class="styles.actions" @click.stop @keydown.stop>
    <slot />
  </div>
</template>
