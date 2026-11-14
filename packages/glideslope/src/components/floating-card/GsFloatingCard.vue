<script setup lang="ts">
/**
 * A floating card: a draggable, resizable panel rendered by the nearest `GsFloatingCardProvider`.
 * The default slot is teleported into the panel, so it keeps the context (provide/inject) of
 * where it is written.
 *
 * The card is open by default. Bind `v-model:open` to open and close it; the header's close button
 * and `useFloatingCard().closeCard()` set it to `false`. Closing unmounts the content, and
 * reopening starts again from `initialPosition` and `initialDimensions`.
 *
 * The card renders no element where it is written, so classes and attributes on it are ignored.
 *
 * @example
 * ```vue
 * <GsFloatingCardProvider>
 *   <GsFloatingCard
 *     id="settings"
 *     v-model:open="open"
 *     title="Settings Panel"
 *     :initial-dimensions="{ width: 400, height: 500 }"
 *   >
 *     <SettingsForm />
 *   </GsFloatingCard>
 * </GsFloatingCardProvider>
 * ```
 */
import { computed, onBeforeUnmount, watch } from 'vue'
import { DEFAULT_DIMENSIONS, DEFAULT_POSITION } from './constants'
import { injectFloatingCardRegistry } from './context'
import type { GsFloatingCardProps } from './types'

defineOptions({ inheritAttrs: false })

const { id, title, initialDimensions, initialPosition } = defineProps<GsFloatingCardProps>()

/** Whether the card is open. */
const open = defineModel<boolean>('open', { default: true })

defineSlots<{
  /** The card's content, teleported into the panel below its header. */
  default?: () => unknown
}>()

const registry = injectFloatingCardRegistry()

watch(
  () => [open.value, id, title] as const,
  ([isOpen, cardId, cardTitle], previous) => {
    if (previous && previous[1] !== cardId) registry.removeCard(previous[1])
    if (!isOpen) {
      registry.removeCard(cardId)
      return
    }
    // Geometry only applies when the card opens; a title change keeps the user's drag and resize.
    registry.openCard(cardId, {
      title: cardTitle,
      position: initialPosition ?? DEFAULT_POSITION,
      dimensions: initialDimensions ?? DEFAULT_DIMENSIONS,
      onClose: () => {
        open.value = false
      },
    })
  },
  { immediate: true },
)

// A card removed from the tree leaves no panel behind.
onBeforeUnmount(() => registry.removeCard(id))

const target = computed(() => (open.value ? registry.cards[id] : undefined))
</script>

<template>
  <Teleport v-if="target" :to="target"><slot /></Teleport>
</template>
