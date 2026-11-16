<script setup lang="ts">
/**
 * A compact pill showing the security classification of a document, dataset or item. Without
 * content it shows the level's name.
 *
 * `provideClassificationBadgeDefaults()` sets the level and size for every badge below the calling
 * component.
 *
 * @example
 * ```vue
 * <GsClassificationBadge variant="secret" />
 *
 * <GsClassificationBadge variant="top-secret" size="small">TOP SECRET//NOFORN</GsClassificationBadge>
 * ```
 */
import { computed } from 'vue'
import type { GsClassificationVariant } from '../classification-banner/types'
import { injectClassificationBadgeDefaults } from './defaults'
import styles from './styles.module.css'
import type { GsClassificationBadgeProps } from './types'

const { variant, size } = defineProps<GsClassificationBadgeProps>()

defineSlots<{
  /** Custom text. Defaults to the level's name (e.g. "TS/SCI"). */
  default?: () => unknown
}>()

const fallbackContent: Record<GsClassificationVariant, string> = {
  missing: 'Missing',
  unclassified: 'Unclassified',
  cui: 'CUI',
  confidential: 'Confidential',
  secret: 'Secret',
  'top-secret': 'Top Secret',
  'ts-sci': 'TS/SCI',
}

const defaults = injectClassificationBadgeDefaults()
const resolvedVariant = computed(() => variant ?? defaults.value.variant ?? 'missing')
const resolvedSize = computed(() => size ?? defaults.value.size ?? 'medium')
</script>

<template>
  <span
    :class="['group/classification-badge', styles.badge, styles[resolvedVariant]]"
    :data-size="resolvedSize"
  >
    <slot>{{ fallbackContent[resolvedVariant] }}</slot>
  </span>
</template>
