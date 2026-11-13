<script setup lang="ts">
/**
 * A single notification message with optional actions. Usually rendered for you by
 * `GsNoticeList` from the `useNotices()` queue; use it directly inside a Reka UI `ToastProvider`
 * for one-off placement. Announced politely to screen readers.
 */
import CancelFillIcon from '@wingbrace/glideslope-icons/cancel-fill'
import { ToastAction, ToastClose, ToastDescription, ToastRoot } from 'reka-ui'
import GsButton from '../button/GsButton.vue'
import type { GsButtonColor } from '../button/types'
import GsIcon from '../icon/GsIcon.vue'
import GsNoticeIcon from './GsNoticeIcon.vue'
import styles from './styles.module.css'
import type { GsNoticeAction, GsNoticeActionKind, GsNoticeColor, GsNoticeProps } from './types'

const {
  message,
  color = 'info',
  primary,
  secondary,
  size = 'medium',
  hideIcon = false,
  showClose = false,
  closeOnAction = false,
  timeout,
  classes,
} = defineProps<GsNoticeProps>()

const emit = defineEmits<{
  /** An action button was chosen: `'primary'` or `'secondary'`. */
  action: [action: GsNoticeActionKind]
  /** The notice closed: timeout, close button, swipe, or an action with `closeOnAction`. */
  close: []
}>()

/** Open state. */
const open = defineModel<boolean>('open', { default: true })

const actionColor: Record<GsNoticeColor, GsButtonColor> = {
  info: 'mono-bold',
  advisory: 'mono-bold',
  normal: 'mono-bold',
  serious: 'serious',
  critical: 'critical',
}

function onOpenChange(next: boolean) {
  open.value = next
  if (!next) emit('close')
}

// Bound on the ToastAction, so it runs before the toast's own close-on-click handler and listeners
// hear about the action before the close.
function choose(kind: GsNoticeActionKind, action: GsNoticeAction) {
  action.onAction?.()
  emit('action', kind)
}
</script>

<template>
  <ToastRoot
    :open="open"
    :duration="timeout ?? Number.POSITIVE_INFINITY"
    :class="['group/notice', styles.notice]"
    :data-color="color"
    :data-size="size"
    @update:open="onOpenChange"
  >
    <div :class="[styles.content, classes?.content]">
      <GsNoticeIcon v-if="!hideIcon && size === 'medium'" :color="color" :size="size" />
      <ToastDescription :class="[styles.message, classes?.message]">{{ message }}</ToastDescription>
      <div v-if="primary || secondary" :class="[styles.actions, classes?.actions]">
        <ToastAction
          v-if="primary"
          :alt-text="primary.label"
          :close-on-click="closeOnAction"
          as-child
          @click="choose('primary', primary)"
        >
          <GsButton
            :color="primary.color ?? actionColor[color]"
            :variant="primary.variant ?? 'filled'"
            :size="size"
          >
            {{ primary.label }}
          </GsButton>
        </ToastAction>
        <ToastAction
          v-if="secondary"
          :alt-text="secondary.label"
          :close-on-click="closeOnAction"
          as-child
          @click="choose('secondary', secondary)"
        >
          <GsButton
            :color="secondary.color ?? actionColor[color]"
            :variant="secondary.variant ?? 'outline'"
            :size="size"
          >
            {{ secondary.label }}
          </GsButton>
        </ToastAction>
      </div>
    </div>
    <ToastClose v-if="showClose" as-child>
      <GsButton variant="icon" :size="size" aria-label="Dismiss">
        <GsIcon><CancelFillIcon /></GsIcon>
      </GsButton>
    </ToastClose>
  </ToastRoot>
</template>
