<script setup lang="ts">
/**
 * One row of a `GsList`. Use `label` for a plain row, or the default slot with `GsIcon` and
 * `GsListItemContent` (`GsListItemTitle`, `GsListItemDescription`).
 *
 * In a list without selection, clicking the row or pressing Enter emits `action`, and opens `href`
 * when the row is a link. Put controls such as a row menu in the `#actions` slot.
 */
import { TagGroupItem, TagGroupItemText } from 'reka-ui'
import { computed, useId, useTemplateRef } from 'vue'
import { injectIconDefaults, provideIconDefaults } from '../icon/defaults'
import { injectListContext } from './context'
import GsListItemActions from './GsListItemActions.vue'
import GsListItemTitle from './GsListItemTitle.vue'
import styles from './styles.module.css'
import type { GsListItemProps } from './types'

const {
  value,
  label,
  textValue,
  disabled = false,
  href,
  target,
  rel,
  classes,
} = defineProps<GsListItemProps>()

const emit = defineEmits<{
  /** The row was activated (only in lists without selection). */
  action: []
}>()

const slots = defineSlots<{
  /** Row content. Defaults to `label`. */
  default?: () => unknown
  /**
   * Controls at the end of the row, such as a `GsMenu`. They don't select the row or name it, and
   * Tab reaches them only in the focused row.
   */
  actions?: () => unknown
}>()

const list = injectListContext()
// Name the row from its text part only, not from buttons or other controls inside it.
const textId = useId()

const inert = computed(() => list.selectable.value || disabled || list.disabled.value)

/**
 * A link row keeps the grid's `row` role, so its text part is a real `<a>`, stretched over the row:
 * pointer users get native link behavior (middle-click, the context menu, the URL on hover), and
 * screen readers find a link inside the row. The row stays the focus stop, so the link is out of
 * the tab order.
 */
const isLink = computed(() => !!href && !inert.value)
const link = useTemplateRef<{ $el: HTMLAnchorElement }>('link')
const linkAttrs = computed(() => (isLink.value ? { href, target, rel, tabindex: -1 } : {}))

/** Opens the link as a click on it would, keeping modifier keys (Ctrl/Cmd opens a new tab). */
function openLink(event: MouseEvent | KeyboardEvent) {
  const { ctrlKey, metaKey, shiftKey, altKey } = event
  link.value?.$el.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      ctrlKey,
      metaKey,
      shiftKey,
      altKey,
    }),
  )
}

function activate(event: MouseEvent | KeyboardEvent) {
  if (inert.value) return
  if (event instanceof KeyboardEvent) {
    // Only Enter on the row itself activates it; keys on controls inside the row are theirs.
    if (event.key !== 'Enter' || event.target !== event.currentTarget) return
    // The click on the link comes back here and emits `action`.
    if (isLink.value) return openLink(event)
  } else if (isLink.value && !link.value?.$el.contains(event.target as Node)) {
    return openLink(event)
  }
  emit('action')
}

/** Keep focus on the row, Reka's roving tab stop, rather than on the link inside it. */
function focusRow(event: MouseEvent) {
  if (event.button !== 0) return
  event.preventDefault()
  ;(event.currentTarget as HTMLElement).closest<HTMLElement>('[role="row"]')?.focus()
}

const iconDefaults = injectIconDefaults()
provideIconDefaults(() => ({
  ...iconDefaults.value,
  class: [iconDefaults.value.class, classes?.icon].filter(Boolean).join(' ') || undefined,
}))
</script>

<template>
  <TagGroupItem
    :value="value"
    :disabled="disabled"
    :text-value="textValue ?? label"
    :aria-labelledby="textValue ? undefined : textId"
    :class="['group/list-item', styles.item, styles[list.variant.value]]"
    @click="activate"
    @keydown="activate"
  >
    <TagGroupItemText
      :id="textId"
      ref="link"
      :as="isLink ? 'a' : 'span'"
      v-bind="linkAttrs"
      :class="[styles.row, { [styles.link ?? '']: isLink }]"
      @mousedown="isLink && focusRow($event)"
    >
      <slot>
        <GsListItemTitle>{{ label }}</GsListItemTitle>
      </slot>
    </TagGroupItemText>
    <GsListItemActions v-if="slots.actions"><slot name="actions" /></GsListItemActions>
  </TagGroupItem>
</template>
