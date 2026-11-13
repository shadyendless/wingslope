<script setup lang="ts">
/**
 * A prominent header block with an icon, title and subtitle, for empty states and page intros.
 * Children can appear in any order; the icon, title and subtitle are always laid out in that
 * order.
 *
 * @example
 * ```vue
 * <GsHero>
 *   <GsIcon><SatelliteIcon /></GsIcon>
 *   <GsHeroTitle>No tracks selected</GsHeroTitle>
 *   <GsHeroSubtitle>Select a track on the map to see its details.</GsHeroSubtitle>
 * </GsHero>
 * ```
 */
import { computed } from 'vue'
import { provideIconDefaults } from '../icon/defaults'
import { provideHeroContext } from './context'
import styles from './styles.module.css'
import type { GsHeroProps } from './types'

const { compact = false, classes } = defineProps<GsHeroProps>()

defineSlots<{
  /** A `GsIcon`, a `GsHeroTitle` and an optional `GsHeroSubtitle`. */
  default?: () => unknown
}>()

provideIconDefaults(
  computed(() => ({
    size: 'large' as const,
    class: [styles.icon, classes?.icon].filter(Boolean).join(' '),
  })),
)

provideHeroContext({
  titleClass: computed(() => [styles.title, classes?.title]),
  subtitleClass: computed(() => [styles.subtitle, classes?.subtitle]),
})
</script>

<template>
  <header :class="['group/hero', styles.hero]" :data-layout="compact ? 'grid' : 'stack'">
    <slot />
  </header>
</template>
