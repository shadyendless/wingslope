<script setup lang="ts">
/**
 * Defers rendering its content by a few animation frames, showing a fallback first.
 *
 * Building a very large collection (thousands of list or tree items) blocks the main thread before
 * anything is shown. Wrapped in `GsDeferredCollection`, the fallback paints first and the browser
 * stays responsive. Slots are rendered lazily, so nothing in the default slot is created until the
 * frames have passed.
 *
 * @example
 * ```vue
 * <GsDeferredCollection :defer-frames="3">
 *   <TrackList :tracks="thousandsOfTracks" />
 *   <template #fallback>
 *     <GsSkeleton v-for="n in 10" :key="n" />
 *   </template>
 * </GsDeferredCollection>
 * ```
 */
import type { GsDeferredCollectionProps } from './types'
import { useFrameDelay } from './use-frame-delay'

const { deferFrames = 2 } = defineProps<GsDeferredCollectionProps>()

defineSlots<{
  /** The content, rendered once the frames have passed. */
  default?: () => unknown
  /** Shown until then. */
  fallback?: () => unknown
}>()

const { ready } = useFrameDelay({ frames: () => deferFrames })
</script>

<template>
  <slot v-if="ready" />
  <slot v-else name="fallback" />
</template>
