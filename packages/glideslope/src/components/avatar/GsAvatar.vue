<script setup lang="ts">
/**
 * A circular user image with a fallback (initials or an icon) and an optional overlay, such as a
 * status badge. Badges in the default slot are pinned to the top-right corner automatically.
 *
 * @example
 * ```vue
 * <GsAvatar src="/avatars/jo.png" alt="Jo Rivera">
 *   <template #fallback>JR</template>
 *   <GsBadge color="normal" />
 * </GsAvatar>
 * ```
 */
import { designTokens } from '@wingbrace/glideslope-foundation/tokens'
import PersonIcon from '@wingbrace/glideslope-icons/person'
import { AvatarFallback, AvatarImage, AvatarRoot } from 'reka-ui'
import { computed } from 'vue'
import { provideBadgeDefaults } from '../badge/defaults'
import GsIcon from '../icon/GsIcon.vue'
import { provideIconDefaults } from '../icon/defaults'
import styles from './styles.module.css'
import type { GsAvatarProps } from './types'

const { src, alt, size = 'medium', fallbackDelay, classes } = defineProps<GsAvatarProps>()

defineSlots<{
  /** Overlay content, such as a `GsBadge`. */
  default?: () => unknown
  /** Shown while the image loads or when it fails. Defaults to a person icon. */
  fallback?: () => unknown
}>()

provideIconDefaults(computed(() => ({ size: size === 'medium' ? 'large' : 'medium' })))
provideBadgeDefaults({ offset: designTokens.spacing.xs, placement: 'top right' })
</script>

<template>
  <AvatarRoot
    :class="['group/avatar', styles.avatar]"
    :role="alt ? 'img' : undefined"
    :aria-label="alt"
    :data-size="size"
  >
    <AvatarImage v-if="src" :src="src" alt="" :class="[styles.image, classes?.image]" />
    <AvatarFallback :delay-ms="fallbackDelay" :class="[styles.fallback, classes?.fallback]">
      <slot name="fallback">
        <GsIcon><PersonIcon /></GsIcon>
      </slot>
    </AvatarFallback>
    <span v-if="$slots.default" :class="[styles.content, classes?.content]">
      <slot />
    </span>
  </AvatarRoot>
</template>
