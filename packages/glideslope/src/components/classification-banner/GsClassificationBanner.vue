<script setup lang="ts">
/**
 * A full-width banner showing the security classification of a page, document or application,
 * for the top or bottom edge of the layout. Without content it shows the level's name.
 *
 * `provideClassificationBannerDefaults()` sets the level for every banner below the calling
 * component.
 *
 * @example
 * ```vue
 * <GsClassificationBanner variant="secret" />
 *
 * <GsClassificationBanner variant="secret">SECRET - AUTHORIZED PERSONNEL ONLY</GsClassificationBanner>
 * ```
 */
import { computed } from 'vue'
import { injectClassificationBannerDefaults } from './defaults'
import styles from './styles.module.css'
import type { GsClassificationBannerProps, GsClassificationVariant } from './types'

const { variant } = defineProps<GsClassificationBannerProps>()

defineSlots<{
  /** Custom text. Defaults to the level's name (e.g. "Top Secret/SCI"). */
  default?: () => unknown
}>()

const fallbackContent: Record<GsClassificationVariant, string> = {
  missing: 'Missing',
  unclassified: 'Unclassified',
  cui: 'CUI',
  confidential: 'Confidential',
  secret: 'Secret',
  'top-secret': 'Top Secret',
  'ts-sci': 'Top Secret/SCI',
}

const defaults = injectClassificationBannerDefaults()
const resolvedVariant = computed(() => variant ?? defaults.value.variant ?? 'missing')
</script>

<template>
  <div :class="[styles.banner, styles[resolvedVariant]]">
    <slot>{{ fallbackContent[resolvedVariant] }}</slot>
  </div>
</template>
