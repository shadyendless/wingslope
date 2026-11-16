<script setup lang="ts">
/**
 * The query builder's button for cloning a rule or group: a small icon `GsButton` showing two
 * overlapping pages, named by the action's `title`. Disabled while the rule or group is.
 *
 * @example
 * ```vue
 * <GsQueryBuilder :fields="fields" show-clone-buttons />
 * ```
 */
import DuplicateIcon from '@wingbrace/glideslope-icons/duplicate'
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
} = defineProps<GsQueryBuilderActionProps>()
</script>

<template>
  <GsButton
    size="small"
    variant="icon"
    :class="className"
    :title="title"
    :aria-label="title"
    :disabled="disabled"
    @click="handleOnClick($event)"
  >
    <GsIcon><DuplicateIcon /></GsIcon>
  </GsButton>
</template>
