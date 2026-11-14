<script setup lang="ts">
/** The value of a flashcard detail. Shows a skeleton while the card is loading. */
import GsDetailsListValue from '../details-list/GsDetailsListValue.vue'
import GsSkeleton from '../skeleton/GsSkeleton.vue'
import { useFlashcard } from './context'
import styles from './styles.module.css'

defineSlots<{
  /** The value. */
  default?: () => unknown
}>()

const flashcard = useFlashcard()
</script>

<template>
  <GsDetailsListValue :class="styles['details-value']">
    <GsSkeleton v-if="flashcard.loading" :class="[styles.skeleton, styles.smaller]" />
    <slot v-else />
  </GsDetailsListValue>
</template>
