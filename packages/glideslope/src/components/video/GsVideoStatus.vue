<script setup lang="ts">
/**
 * Internal: `GsVideo`'s loading and error overlays. It reads the media state, so it renders inside
 * the video's `GsMediaController`.
 */
import LoopIcon from '@wingbrace/glideslope-icons/loop'
import ProblemIcon from '@wingbrace/glideslope-icons/problem'
import { computed } from 'vue'
import GsIcon from '../icon/GsIcon.vue'
import { useMediaSelector } from '../media-controls/use-media'
import styles from './styles.module.css'

const { error } = defineProps<{
  /** The load error to show, or an empty string. */
  error: string
}>()

const loading = useMediaSelector((state) => state.mediaLoading ?? false)
const duration = useMediaSelector((state) => state.mediaDuration)
const metadataLoaded = computed(() => duration.value != null && duration.value > 0)
/** Shown until the metadata loads, and while buffering. */
const showLoading = computed(() => !error && (loading.value || !metadataLoaded.value))
</script>

<template>
  <output v-if="showLoading" :class="styles.loadingOverlay" aria-label="Loading video">
    <GsIcon size="medium" :class="styles.loadingSpinner"><LoopIcon /></GsIcon>
  </output>
  <div v-if="error" :class="styles.errorOverlay" role="alert">
    <GsIcon size="medium"><ProblemIcon /></GsIcon>
    <span :class="styles.errorText">{{ error }}</span>
  </div>
</template>
