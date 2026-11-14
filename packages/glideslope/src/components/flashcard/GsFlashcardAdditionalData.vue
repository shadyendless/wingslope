<script setup lang="ts">
/** Secondary data below a `GsFlashcardHero`. Hidden while the card is loading. */
import { useFlashcard } from './context'
import styles from './styles.module.css'

defineSlots<{
  /** The data to show. */
  default?: () => unknown
}>()

const flashcard = useFlashcard()
</script>

<template>
  <div v-if="!flashcard.loading" :class="styles.data"><slot /></div>
</template>
