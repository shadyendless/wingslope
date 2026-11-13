<script setup lang="ts">
/**
 * Shows a system or connection status with a distinct shape per status, so it does not rely on
 * color alone: good (circle), degraded (diamond), poor (triangle), pending (ring), unknown (dot).
 *
 * @example
 * ```vue
 * <GsStatusIndicator status="degraded" label="Uplink degraded" />
 * ```
 */
import styles from './styles.module.css'
import type { GsStatusIndicatorProps } from './types'

const { status = 'good', label } = defineProps<GsStatusIndicatorProps>()
</script>

<template>
  <div v-if="label" :class="styles.labeled">
    <span :class="styles.iconSlot">
      <span :class="styles.icon" :data-status="status" aria-hidden="true" />
    </span>
    <span :class="styles.label">{{ label }}</span>
  </div>
  <span v-else :class="styles.icon" :data-status="status" role="img" :aria-label="status" />
</template>
