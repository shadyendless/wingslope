<script setup lang="ts">
/**
 * Shows queued notices from `useNotices()`, newest first. With a `placement` it stacks them on one
 * edge or corner of its positioned parent (or of the viewport, with `global`); without one it
 * renders them in place. Place one list without an `id` for app-wide notices, and add lists with
 * an `id` for notices that target a specific panel.
 *
 * Focus jumps to the notices with F8.
 *
 * @example
 * ```vue
 * <GsNoticeList placement="bottom right" global :default-timeout="6000" />
 *
 * // anywhere
 * useNotices().queue({ message: 'Uplink restored', color: 'normal' })
 * ```
 */
import { ToastProvider, ToastViewport } from 'reka-ui'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsNotice from './GsNotice.vue'
import styles from './styles.module.css'
import type { GsNoticeActionKind, GsNoticeContent, GsNoticeListProps } from './types'
import {
  registerNoticeList,
  reportNoticeAction,
  reportNoticeClose,
  useNotices,
} from './use-notices'

// Attributes go to the region element, which may be teleported to `body`.
defineOptions({ inheritAttrs: false })

const {
  id,
  global = false,
  placement,
  limit = 3,
  defaultColor = 'info',
  defaultTimeout,
  size = 'medium',
  hideClearAll = false,
  label = 'Notifications',
  classes,
} = defineProps<GsNoticeListProps>()

const { notices, dequeue } = useNotices()

const mine = computed(() => notices.value.filter((notice) => notice.target === id))
// Newest first: newer notices push older ones out of view until a visible one closes.
const visible = computed(() => (limit > 0 ? mine.value.slice(-limit).reverse() : []))

let unregister: (() => void) | undefined
onMounted(() => {
  unregister = registerNoticeList({ id: () => id, defaultColor: () => defaultColor })
})
onBeforeUnmount(() => unregister?.())

/** A close button unless the notice can only be dismissed by its timeout or its actions. */
function showsClose(notice: GsNoticeContent) {
  const timeout = notice.timeout ?? defaultTimeout
  return notice.showClose ?? !(timeout && notice.primary && notice.secondary)
}

function onAction(notice: GsNoticeContent, action: GsNoticeActionKind) {
  reportNoticeAction(notice, action)
}

function onClose(notice: GsNoticeContent) {
  dequeue(notice.id)
  reportNoticeClose(notice)
}

function clearAll() {
  const cleared = mine.value
  for (const notice of cleared) dequeue(notice.id)
  for (const notice of cleared) reportNoticeClose(notice)
}
</script>

<template>
  <Teleport to="body" :disabled="!global">
    <ToastProvider swipe-direction="right" label="Notification">
      <div
        v-bind="$attrs"
        :class="['group/region', styles.region]"
        :data-placement="placement"
        :data-global="global || undefined"
      >
        <GsButton
          v-if="!hideClearAll && visible.length > 1"
          variant="flat"
          size="small"
          :class="[styles.clearAll, classes?.button]"
          @click="clearAll"
        >
          Clear all
        </GsButton>
        <ToastViewport :class="[styles.list, classes?.list]" :label="`${label} ({hotkey})`">
          <GsNotice
            v-for="notice in visible"
            :key="notice.id"
            :message="notice.message"
            :color="notice.color ?? defaultColor"
            :primary="notice.primary"
            :secondary="notice.secondary"
            :timeout="notice.timeout ?? defaultTimeout"
            :size="size"
            :show-close="showsClose(notice)"
            :hide-icon="notice.hideIcon"
            :close-on-action="notice.closeOnAction"
            :class="classes?.notice?.notice"
            :classes="classes?.notice"
            @action="onAction(notice, $event)"
            @close="onClose(notice)"
          />
        </ToastViewport>
      </div>
    </ToastProvider>
  </Teleport>
</template>
