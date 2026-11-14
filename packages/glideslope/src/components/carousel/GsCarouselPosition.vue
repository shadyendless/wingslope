<script setup lang="ts">
/**
 * Shows the active item's position and the item count, e.g. "3 / 9". Must be used inside a
 * `GsCarousel`.
 */
import { useCarousel } from './context'
import styles from './styles.module.css'

const carousel = useCarousel()
</script>

<template>
  <div :class="styles.position">{{ carousel.position + 1 }} / {{ carousel.items.length }}</div>
</template>
