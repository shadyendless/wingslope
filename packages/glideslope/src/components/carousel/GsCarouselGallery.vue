<script setup lang="ts">
/**
 * A strip of thumbnail toggle buttons, one per carousel item. Pressing a thumbnail makes its item
 * active. The strip slides to keep the active thumbnail in view, with two thumbnails before it.
 * Must be used inside a `GsCarousel`.
 *
 * Each thumbnail is named by its item's `title` (the image's alternative text) and reports
 * whether it is the active item with `aria-pressed`.
 */
import { onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import GsToggleButton from '../button/GsToggleButton.vue'
import { useCarousel } from './context'
import styles from './styles.module.css'
import type { GsCarouselGalleryProps } from './types'

const { classes } = defineProps<GsCarouselGalleryProps>()

/** Thumbnails kept visible before the active one, so it isn't pinned to the leading edge. */
const VISIBLE_ITEMS_BEFORE_SELECTED = 2

const carousel = useCarousel()
const container = useTemplateRef<HTMLElement>('container')
const offset = shallowRef(0)

/** Slides the strip so the active thumbnail has two thumbnails before it. */
function updateOffset() {
  const element = container.value
  const first = element?.firstElementChild
  if (!element || !first) return
  if (carousel.position <= VISIBLE_ITEMS_BEFORE_SELECTED) {
    offset.value = 0
    return
  }
  const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0
  const step = first.getBoundingClientRect().width + gap
  offset.value = (VISIBLE_ITEMS_BEFORE_SELECTED - carousel.position) * step
}

onMounted(updateOffset)
// After the DOM updates and before the browser paints, so the strip doesn't flicker.
watch(() => carousel.position, updateOffset, { flush: 'post' })
</script>

<template>
  <div
    ref="container"
    :class="styles['gallery-container']"
    :style="{ '--carousel-gallery-offset': `${offset}px` }"
  >
    <GsToggleButton
      v-for="(item, index) in carousel.items"
      :key="item.id"
      :model-value="index === carousel.position"
      :class="[styles['gallery-item'], classes?.item]"
      size="small"
      color="accent"
      :data-id="`thumbnail-id-${item.id}`"
      @update:model-value="carousel.setPosition(index)"
    >
      <img :src="item.thumbnailUrl" :alt="item.title" />
    </GsToggleButton>
  </div>
</template>
