<script setup lang="ts">
/**
 * The upper section of a `GsFlashcard`, showing its `header` (as an `<h3>`) and `subheader`. While
 * the card is loading it shows two skeleton lines instead.
 */
import GsSkeleton from '../skeleton/GsSkeleton.vue'
import { useFlashcard } from './context'
import styles from './styles.module.css'

const flashcard = useFlashcard()
</script>

<template>
  <div v-if="flashcard.loading" :class="styles.loading">
    <GsSkeleton :class="styles.skeleton" />
    <GsSkeleton :class="[styles.skeleton, styles.half]" />
  </div>
  <div v-else :class="styles.hero">
    <h3 :class="styles.header">{{ flashcard.header }}</h3>
    <span :class="styles.subheader">{{ flashcard.subheader }}</span>
  </div>
</template>
