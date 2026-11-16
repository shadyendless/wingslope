<script setup lang="ts">
/**
 * The query builder's button for locking and unlocking a rule or group: a small icon `GsButton`
 * showing a padlock. Locking disables the rule or group; while it is locked the button is named
 * by the `disabledTranslation` title ("Unlock rule") and stays enabled. It is disabled only when
 * a parent group is locked.
 *
 * @example
 * ```vue
 * <GsQueryBuilder :fields="fields" show-lock-buttons />
 * ```
 */
import LockFillIcon from '@wingbrace/glideslope-icons/lock-fill'
import { computed } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import type { GsQueryBuilderActionProps } from './types'

// The query builder passes every control its whole prop bag; only the declared props are used.
defineOptions({ inheritAttrs: false })

const {
  handleOnClick,
  className,
  title,
  disabled = false,
  disabledTranslation,
} = defineProps<GsQueryBuilderActionProps>()

const name = computed(() =>
  disabled && disabledTranslation?.title ? disabledTranslation.title : title,
)
</script>

<template>
  <GsButton
    size="small"
    variant="icon"
    :class="className"
    :title="name"
    :aria-label="name"
    :disabled="disabled && !disabledTranslation"
    @click="handleOnClick($event)"
  >
    <GsIcon><LockFillIcon /></GsIcon>
  </GsButton>
</template>
