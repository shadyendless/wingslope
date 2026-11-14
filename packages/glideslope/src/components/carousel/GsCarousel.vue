<script setup lang="ts">
/**
 * A compound component for navigating a collection of image, video and audio items. Bind the
 * active item's zero-based index with `v-model`; without it the carousel keeps it locally.
 *
 * Compose the layout from its parts, which read the carousel's state: `GsCarouselViewer`,
 * `GsCarouselPrevious`, `GsCarouselNext`, `GsCarouselGallery`, `GsCarouselPosition` and
 * `GsCarouselSelect`.
 *
 * @example
 * ```vue
 * <GsCarousel v-model="position" :items="items">
 *   <GsCarouselViewer />
 *   <div class="flex gap-s">
 *     <GsCarouselPrevious />
 *     <GsCarouselGallery />
 *     <GsCarouselNext />
 *   </div>
 * </GsCarousel>
 * ```
 */
import { provideCarouselContext } from './context'
import styles from './styles.module.css'
import type { GsCarouselProps } from './types'

const { items = [] } = defineProps<GsCarouselProps>()

/** Zero-based index of the active item. */
const position = defineModel<number>({ default: 0 })

defineSlots<{
  /** The carousel parts, in any layout. */
  default?: () => unknown
}>()

// Getters keep the parts reactive without copying or wrapping the consumer's items.
provideCarouselContext({
  get items() {
    return items
  },
  get position() {
    return position.value
  },
  setPosition(index: number) {
    position.value = index
  },
})
</script>

<template>
  <div :class="styles.carousel"><slot /></div>
</template>
