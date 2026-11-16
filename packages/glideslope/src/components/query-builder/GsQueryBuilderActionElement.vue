<script setup lang="ts">
/**
 * @internal The query builder's default action button (add rule, add group, remove group): a
 * small outline `GsButton` whose text is the action's `title`. While the rule or group is
 * disabled it shows the `disabledTranslation` title instead, if there is one, and stays enabled
 * so it can undo the lock.
 */
import { computed } from 'vue'
import GsButton from '../button/GsButton.vue'
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

const text = computed(() =>
  disabled && disabledTranslation?.title ? disabledTranslation.title : title,
)
</script>

<template>
  <GsButton
    size="small"
    variant="outline"
    :class="className"
    :disabled="disabled && !disabledTranslation"
    @click="handleOnClick($event)"
  >
    {{ text }}
  </GsButton>
</template>
