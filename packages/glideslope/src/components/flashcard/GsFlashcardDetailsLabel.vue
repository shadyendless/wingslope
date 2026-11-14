<script setup lang="ts">
/** The label of a flashcard detail. Shows a skeleton while the card is loading. */
import GsDetailsListLabel from '../details-list/GsDetailsListLabel.vue'
import GsSkeleton from '../skeleton/GsSkeleton.vue'
import { useFlashcard } from './context'
import styles from './styles.module.css'

defineSlots<{
  /** The label text. */
  default?: () => unknown
}>()

const flashcard = useFlashcard()
</script>

<template>
  <GsDetailsListLabel :class="styles['details-label']">
    <GsSkeleton v-if="flashcard.loading" :class="[styles.skeleton, styles.smaller]" />
    <slot v-else />
  </GsDetailsListLabel>
</template>
