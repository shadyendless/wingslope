<script setup lang="ts">
/**
 * A `GsButton` that makes the carousel's previous item active, labelled "Previous". It is disabled
 * at the first item. Must be used inside a `GsCarousel`.
 *
 * Pass `aria-label` to relabel it, e.g. in another language.
 */
import ChevronLeftIcon from '@wingbrace/glideslope-icons/chevron-left'
import { computed } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import { useCarousel } from './context'
import styles from './styles.module.css'
import type { GsCarouselNavigationProps } from './types'

const {
  variant = 'flat',
  size,
  color,
  disabled = undefined,
} = defineProps<GsCarouselNavigationProps>()

const carousel = useCarousel()
const atStart = computed(() => carousel.position <= 0)

function previous() {
  if (carousel.position - 1 >= 0) carousel.setPosition(carousel.position - 1)
}
</script>

<template>
  <GsButton
    aria-label="Previous"
    :class="styles.navigation"
    :variant="variant"
    :size="size"
    :color="color"
    :disabled="atStart || disabled"
    @click="previous"
  >
    <GsIcon><ChevronLeftIcon /></GsIcon>
  </GsButton>
</template>
