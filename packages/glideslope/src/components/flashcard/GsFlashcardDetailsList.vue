<script setup lang="ts">
/**
 * The key-value details of a `GsFlashcard`: a justified `GsDetailsList`. Only the first five
 * label/value pairs are shown, so the card stays a quick identifier.
 */
import GsDetailsList from '../details-list/GsDetailsList.vue'
import styles from './styles.module.css'

defineSlots<{
  /** `GsFlashcardDetailsLabel` and `GsFlashcardDetailsValue` pairs. */
  default?: () => unknown
}>()
</script>

<template>
  <GsDetailsList align="justify" :class="styles['details-list']"><slot /></GsDetailsList>
</template>
