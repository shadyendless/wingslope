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
import { AvatarFallback, AvatarImage, AvatarRoot, type AvatarImageEmits } from 'reka-ui'
import { computed } from 'vue'
import { provideBadgeDefaults } from '../badge/defaults'
import GsIcon from '../icon/GsIcon.vue'
import { provideIconDefaults } from '../icon/defaults'
import { injectAvatarDefaults } from './defaults'
import styles from './styles.module.css'
import type { GsAvatarProps } from './types'

const { src, alt, size, fallbackDelay, classes } = defineProps<GsAvatarProps>()

const emit = defineEmits<{
  /** The image loaded and is shown. Emitted again after `src` changes. */
  load: []
  /** The image failed to load, so the fallback stays. Not emitted when there is no `src`. */
  error: []
}>()

defineSlots<{
  /** Overlay content, such as a `GsBadge`. */
  default?: () => unknown
  /** Shown while the image loads or when it fails. Defaults to a person icon. */
  fallback?: () => unknown
}>()

const defaults = injectAvatarDefaults()
const resolvedSize = computed(() => size ?? defaults.value.size ?? 'medium')

provideIconDefaults(
  computed(() => ({ size: resolvedSize.value === 'medium' ? 'large' : 'medium' })),
)
provideBadgeDefaults({ offset: designTokens.spacing.xs, placement: 'top right' })

function onLoadingStatusChange(status: AvatarImageEmits['loadingStatusChange'][0]) {
  if (status === 'loaded') emit('load')
  else if (status === 'error') emit('error')
}
</script>

<template>
  <AvatarRoot
    :class="['group/avatar', styles.avatar, defaults.class]"
    :role="alt ? 'img' : undefined"
    :aria-label="alt"
    :data-size="resolvedSize"
  >
    <!-- The root carries the name, so the image is decorative. Reka gives it role="img", which
         conflicts with alt="". -->
    <AvatarImage
      v-if="src"
      :src="src"
      alt=""
      role="presentation"
      :class="[styles.image, classes?.image]"
      @loading-status-change="onLoadingStatusChange"
    />
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
