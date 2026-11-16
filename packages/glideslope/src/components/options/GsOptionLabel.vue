<script setup lang="ts">
/**
 * The main text of a `GsOption`. In a select, this is the text shown in the trigger once the
 * option is chosen. In a combobox, the part matching the typed filter text is highlighted.
 */
import { SelectItemText, injectComboboxRootContext } from 'reka-ui'
import { Comment, Text, type VNode } from 'vue'
import { injectOptionsContext } from './context'
import styles from './styles.module.css'

const slots = defineSlots<{
  default?: () => VNode[]
}>()

const options = injectOptionsContext()
const combobox = options.kind === 'combobox' ? injectComboboxRootContext(null) : null

/**
 * Splits plain-text content around the filter match, or returns `null` to render the slot as is.
 * Called from the template so the slot is only invoked during render.
 */
function splitOnFilter(): [string, string, string] | null {
  const query = combobox?.filterSearch.value.trim()
  if (!query) return null
  const nodes = (slots.default?.() ?? []).filter((node) => node.type !== Comment)
  const only = nodes.length === 1 ? nodes[0] : undefined
  if (only?.type !== Text || typeof only.children !== 'string') return null
  const text = only.children
  const start = text.toLowerCase().indexOf(query.toLowerCase())
  if (start === -1) return null
  return [
    text.slice(0, start),
    text.slice(start, start + query.length),
    text.slice(start + query.length),
  ]
}
</script>

<template>
  <component :is="options.kind === 'select' ? SelectItemText : 'span'" :class="styles.label">
    <template v-for="(split, index) in [splitOnFilter()]" :key="index">
      <template v-if="split">
        {{ split[0] }}<mark :class="styles.highlight">{{ split[1] }}</mark>{{ split[2] }}
      </template>
      <slot v-else />
    </template>
  </component>
</template>
