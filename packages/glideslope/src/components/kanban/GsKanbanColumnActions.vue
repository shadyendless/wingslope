<script setup lang="ts">
/** An "Add Card" button for the end of a column, after its `GsKanbanColumnContent`. */
import AddIcon from '@wingbrace/glideslope-icons/add'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import styles from './styles.module.css'

const emit = defineEmits<{
  /** The button was pressed. */
  addCard: []
}>()

defineSlots<{
  /** The button's text. @default 'Add Card' */
  default?: () => unknown
}>()
</script>

<template>
  <div :class="styles.columnHeader">
    <GsButton variant="flat" @click="emit('addCard')">
      <GsIcon><AddIcon /></GsIcon>
      <slot>Add Card</slot>
    </GsButton>
  </div>
</template>
