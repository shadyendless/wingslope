<script setup lang="ts">
/**
 * Shows the full-size media of the carousel's active item: an image, a `GsVideo` or a `GsAudio`
 * player, depending on its `dataType`. Must be used inside a `GsCarousel`.
 *
 * The default slot renders inside the viewer, after the media, for overlay content.
 */
import { computed } from 'vue'
import GsAudio from '../audio/GsAudio.vue'
import GsVideo from '../video/GsVideo.vue'
import { useCarousel } from './context'
import styles from './styles.module.css'
import type { GsCarouselViewerProps } from './types'

const { classes } = defineProps<GsCarouselViewerProps>()

defineSlots<{
  /** Overlay content, rendered inside the viewer after the media. */
  default?: () => unknown
}>()

const carousel = useCarousel()
const item = computed(() => carousel.items[carousel.position])
</script>

<template>
  <div :class="styles.viewer">
    <div :class="[classes?.media, styles['viewer-item']]" :data-media="item?.dataType">
      <template v-if="item">
        <GsVideo
          v-if="item.dataType === 'video'"
          :key="item.id"
          :class="classes?.media"
          :src="item.dataUrl"
          :poster="item.thumbnailUrl"
        />
        <GsAudio
          v-else-if="item.dataType === 'audio'"
          :key="item.id"
          :src="item.dataUrl"
          :title="item.title"
        />
        <img v-else :key="item.id" :class="styles.image" :src="item.dataUrl" :alt="item.title" />
      </template>
    </div>
    <slot />
  </div>
</template>
