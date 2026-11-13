<script setup lang="ts">
/** Secondary text under a `GsTreeItemLabel`. Not shown in a `crammed` tree. */
import { useId } from 'vue'
import { injectTreeVariant, useTreeRowText } from './context'
import styles from './styles.module.css'

defineSlots<{
  /** Description text. */
  default?: () => unknown
}>()

const variant = injectTreeVariant()
const id = useId()
useTreeRowText(id, () => variant.value !== 'crammed')
</script>

<template>
  <!-- The leading space separates this text from the label's for tools that read the row's text
       by joining text nodes (axe's label-in-name check). It collapses away when rendered. -->
  <div v-if="variant !== 'crammed'" :id="id" data-slot="description" :class="styles.description">
    {{ ' ' }}<slot />
  </div>
</template>
