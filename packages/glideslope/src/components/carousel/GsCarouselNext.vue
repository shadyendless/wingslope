<script setup lang="ts">
/**
 * A `GsButton` that makes the carousel's next item active, labelled "Next". It is disabled at the
 * last item. Must be used inside a `GsCarousel`.
 *
 * Pass `aria-label` to relabel it, e.g. in another language.
 */
import ChevronRightIcon from '@wingbrace/glideslope-icons/chevron-right'
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
const atEnd = computed(() => carousel.position >= carousel.items.length - 1)

function next() {
  if (carousel.position + 1 < carousel.items.length) carousel.setPosition(carousel.position + 1)
}
</script>

<template>
  <GsButton
    aria-label="Next"
    :class="styles.navigation"
    :variant="variant"
    :size="size"
    :color="color"
    :disabled="atEnd || disabled"
    @click="next"
  >
    <GsIcon><ChevronRightIcon /></GsIcon>
  </GsButton>
</template>
