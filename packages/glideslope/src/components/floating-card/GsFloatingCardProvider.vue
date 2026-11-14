<script setup lang="ts">
/**
 * The layout area for floating cards. It renders every open `GsFloatingCard` below it as a
 * draggable, resizable, non-modal panel, and provides `useFloatingCard()`.
 *
 * The provider covers its nearest positioned ancestor (`absolute inset-0`) but lets pointer
 * events through, so only the cards themselves are interactive. Cards are dragged by their header,
 * resized from any edge or corner, raised above the others when pressed, and kept inside the
 * provider (or the viewport, with `bounds="viewport"`). A pinned card can't be dragged or resized.
 *
 * @example
 * ```vue
 * <div class="relative h-full">
 *   <GsFloatingCardProvider :header-actions="['pin']">
 *     <template #icon><PlaceholderIcon /></template>
 *     <GsFloatingCard id="details" title="Details">…</GsFloatingCard>
 *   </GsFloatingCardProvider>
 * </div>
 * ```
 */
import CancelIcon from '@wingbrace/glideslope-icons/cancel'
import PinIcon from '@wingbrace/glideslope-icons/pin'
import {
  Comment,
  Fragment,
  Text,
  h,
  reactive,
  shallowReactive,
  useTemplateRef,
  type FunctionalComponent,
  type VNode,
} from 'vue'
import GsButton from '../button/GsButton.vue'
import GsDivider from '../divider/GsDivider.vue'
import GsIcon from '../icon/GsIcon.vue'
import { DRAG_THRESHOLD, UNTITLED_LABEL } from './constants'
import { provideFloatingCardContext, type FloatingCardRegistration } from './context'
import { constrainPosition, resizeGeometry, type ResizeStart } from './geometry'
import styles from './styles.module.css'
import type {
  GsFloatingCardBounds,
  GsFloatingCardHeaderAction,
  GsFloatingCardLayout,
  GsFloatingCardPosition,
  GsFloatingCardProviderProps,
  GsFloatingCardResizeHandle,
} from './types'
import { useCardLayout } from './use-card-layout'
import { usePointerSession } from './use-pointer-session'

const {
  headerActions,
  bounds = 'provider',
  initialPinned,
} = defineProps<GsFloatingCardProviderProps>()

const slots = defineSlots<{
  /** Application content and the `GsFloatingCard`s. */
  default?: () => unknown
  /**
   * Icon at the start of every card's header, receiving the card's `id`. Render nothing for a card
   * to leave its icon out.
   */
  icon?: (props: { id: string }) => unknown
}>()

const RESIZE_HANDLES: readonly GsFloatingCardResizeHandle[] = [
  'n',
  's',
  'e',
  'w',
  'ne',
  'nw',
  'se',
  'sw',
]

/** Elements with pointer behavior of their own, which never start a drag. */
const INTERACTIVE = [
  'button',
  'input',
  'select',
  'textarea',
  'a',
  '[role="button"]',
  '[role="link"]',
  '[contenteditable]',
].join(', ')

const root = useTemplateRef<HTMLElement>('root')
const cards = shallowReactive<Record<string, HTMLElement>>({})
const pinned = reactive(new Set<string>(initialPinned))
const closeListeners = new Map<string, () => void>()
const { layouts, register, unregister, move, resize, bringToFront } = useCardLayout()

function isPinned(id: string): boolean {
  return pinned.has(id)
}

function togglePinCard(id: string) {
  if (pinned.has(id)) pinned.delete(id)
  else pinned.add(id)
}

function openCard(id: string, { title, position, dimensions, onClose }: FloatingCardRegistration) {
  register(id, title, position, dimensions)
  closeListeners.set(id, onClose)
}

function removeCard(id: string) {
  unregister(id)
  delete cards[id]
  // A closed card reopens unpinned.
  pinned.delete(id)
  closeListeners.delete(id)
}

function closeCard(id: string) {
  const onClose = closeListeners.get(id)
  removeCard(id)
  onClose?.()
}

/** Records a card's content element. Function refs also run with `null` on re-render; ignore those. */
function setContent(id: string, element: unknown) {
  if (element instanceof HTMLElement && cards[id] !== element) cards[id] = element
}

provideFloatingCardContext(
  { cards, closeCard, togglePinCard, isPinned },
  { cards, openCard, removeCard },
)

/** The box cards are kept inside, in the provider's coordinates (cards are positioned in it). */
function getBounds(): GsFloatingCardBounds {
  const element = root.value
  if (!element) return { top: 0, left: 0, right: 0, bottom: 0 }
  const rect = element.getBoundingClientRect()
  if (bounds === 'viewport') {
    return {
      top: -rect.top,
      left: -rect.left,
      right: window.innerWidth - rect.left,
      bottom: window.innerHeight - rect.top,
    }
  }
  return { top: 0, left: 0, right: rect.width, bottom: rect.height }
}

function isInteractive(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(INTERACTIVE) !== null
}

interface DragSession {
  id: string
  dragging: boolean
  pointerX: number
  pointerY: number
  origin: GsFloatingCardPosition
  bounds: GsFloatingCardBounds
}

// Bounds are read once per gesture rather than on every move, to keep moves off the layout path.
const drag = usePointerSession<DragSession, string>({
  shouldStart: (event, id) => !isPinned(id) && event.button === 0 && !isInteractive(event.target),
  onStart: (event, id) => {
    const layout = layouts[id]
    if (!layout) return null
    return {
      id,
      dragging: false,
      pointerX: event.clientX,
      pointerY: event.clientY,
      origin: { ...layout.position },
      bounds: getBounds(),
    }
  },
  onMove: (event, session) => {
    const deltaX = event.clientX - session.pointerX
    const deltaY = event.clientY - session.pointerY
    // A press only becomes a drag past the threshold, so a click on the header stays a click.
    if (!session.dragging && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return
    if (!session.dragging) {
      session.dragging = true
      bringToFront(session.id)
    }
    const layout = layouts[session.id]
    if (!layout) return
    move(
      session.id,
      constrainPosition(
        { x: session.origin.x + deltaX, y: session.origin.y + deltaY },
        layout.dimensions,
        session.bounds,
      ),
    )
  },
})

interface ResizeSession extends ResizeStart {
  id: string
  pointerX: number
  pointerY: number
}

const resizing = usePointerSession<
  ResizeSession,
  { id: string; handle: GsFloatingCardResizeHandle }
>({
  shouldStart: (event, { id }) => !isPinned(id) && event.button === 0,
  onStart: (event, { id, handle }) => {
    const layout = layouts[id]
    if (!layout) return null
    bringToFront(id)
    return {
      id,
      handle,
      pointerX: event.clientX,
      pointerY: event.clientY,
      origin: { ...layout.position },
      size: { ...layout.dimensions },
      bounds: getBounds(),
    }
  },
  onMove: (event, session) => {
    const { dimensions, position } = resizeGeometry(
      session,
      event.clientX - session.pointerX,
      event.clientY - session.pointerY,
    )
    resize(session.id, dimensions, position)
  },
})

function onHeaderPointerDown(id: string, event: PointerEvent) {
  bringToFront(id)
  drag.start(event, id)
}

function actionsFor(id: string): readonly GsFloatingCardHeaderAction[] {
  return (typeof headerActions === 'function' ? headerActions(id) : headerActions) ?? []
}

function panelStyle(layout: GsFloatingCardLayout) {
  return {
    '--floating-card-x': `${layout.position.x}px`,
    '--floating-card-y': `${layout.position.y}px`,
    '--floating-card-width': `${layout.dimensions.width}px`,
    '--floating-card-height': `${layout.dimensions.height}px`,
    '--floating-card-z-index': layout.zIndex,
  }
}

/** Whether rendered slot content has anything besides comments and whitespace. */
function hasContent(nodes: VNode[]): boolean {
  return nodes.some(({ type, children }) => {
    if (type === Comment) return false
    if (type === Fragment) return Array.isArray(children) && hasContent(children as VNode[])
    if (type === Text) return typeof children !== 'string' || children.trim() !== ''
    return true
  })
}

/** The `#icon` slot for one card, in a small icon, or nothing when the slot renders nothing. */
const HeaderIcon: FunctionalComponent<{ id: string }> = ({ id }) => {
  const nodes = slots.icon?.({ id }) as VNode[] | undefined
  return nodes && hasContent(nodes) ? h(GsIcon, { size: 'small' }, () => nodes) : null
}
HeaderIcon.props = ['id']
</script>

<template>
  <div ref="root" :class="styles.provider">
    <div
      v-for="(layout, id) in layouts"
      :key="id"
      role="dialog"
      aria-modal="false"
      :aria-label="layout.title ?? UNTITLED_LABEL"
      :class="styles.panel"
      :data-pinned="isPinned(id) ? '' : undefined"
      :style="panelStyle(layout)"
      @pointerdown="bringToFront(id)"
      @focusin="bringToFront(id)"
    >
      <div :class="styles.header" @pointerdown="onHeaderPointerDown(id, $event)">
        <div :class="styles['header-side']">
          <HeaderIcon :id="id" />
          <div v-if="layout.title" :class="styles['header-title-container']">
            <div :class="styles['header-title']">{{ layout.title }}</div>
          </div>
        </div>
        <div :class="styles['header-actions']">
          <template v-for="(action, index) in actionsFor(id)" :key="index">
            <GsDivider v-if="action === 'divider'" orientation="vertical" />
            <GsButton
              v-else-if="action === 'pin'"
              aria-label="Pin"
              :aria-pressed="isPinned(id)"
              :color="isPinned(id) ? 'accent' : undefined"
              size="small"
              variant="icon"
              @click="togglePinCard(id)"
            >
              <GsIcon><PinIcon /></GsIcon>
            </GsButton>
            <GsButton
              v-else
              :aria-label="action.label"
              size="small"
              variant="icon"
              @click="action.onClick()"
            >
              <GsIcon><component :is="action.icon" /></GsIcon>
            </GsButton>
          </template>
          <GsButton aria-label="Close" size="small" variant="icon" @click="closeCard(id)">
            <GsIcon><CancelIcon /></GsIcon>
          </GsButton>
        </div>
      </div>

      <div :ref="(element) => setContent(id, element)" :class="styles.content" />

      <template v-if="!isPinned(id)">
        <div
          v-for="handle in RESIZE_HANDLES"
          :key="handle"
          aria-hidden="true"
          :class="styles[`resize-${handle}`]"
          :data-handle="handle"
          @pointerdown="resizing.start($event, { id, handle })"
        />
      </template>
    </div>
    <slot />
  </div>
</template>
