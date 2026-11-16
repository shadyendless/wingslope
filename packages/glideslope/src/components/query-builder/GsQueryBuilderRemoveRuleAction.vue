<script setup lang="ts">
/**
 * The query builder's button for removing a rule: a small icon `GsButton` showing a trash can,
 * named by the action's `title`. Disabled while the rule is.
 *
 * @example
 * ```vue
 * <GsQueryBuilder :fields="fields" :control-elements="{ removeGroupAction: GsQueryBuilderRemoveRuleAction }" />
 * ```
 */
import DeleteIcon from '@wingbrace/glideslope-icons/delete'
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
    <GsIcon><DeleteIcon /></GsIcon>
  </GsButton>
</template>
