<script setup lang="ts">
/**
 * @internal The chart's root element, the vertical scroll container. A tall inner element gives
 * it the scroll range of all the rows; the visible region inside sticks to the top while the panel
 * and content sides are scrolled to match.
 *
 * It and the content side (the horizontal scroll container) are focusable, so the keyboard can
 * scroll them; the Design Toolkit's aren't. It is a region named "Gantt chart" unless the
 * `GsGantt` has an `aria-label` or `aria-labelledby`, which fall through to it.
 */
import { computed } from 'vue'
import { useRootElementHeight } from './composables/use-root-element-height'
import { useVerticalScrollUpdate } from './composables/use-vertical-scroll-update'
import {
  GANTT_CONTAINER_TOP_PX,
  GANTT_HEADER_HEIGHT_PX,
  GANTT_ROW_ELEMENT_HEIGHT_PX,
  TIMELINE_CHUNK_WIDTH_PX,
} from './constants'
import { elementRef, injectGanttContext } from './context'
import { selectors, useGanttStore } from './store'
import styles from './styles.module.css'

defineSlots<{
  default?: () => unknown
}>()

const { rootElement, rowHeightPx } = injectGanttContext()
const setRootElement = elementRef(rootElement)
const { onScroll } = useVerticalScrollUpdate()
const virtualizedHeightPx = useGanttStore(selectors.virtualizedHeightPx)
const rootElementHeight = useRootElementHeight()

const rootStyle = computed(() => ({
  '--gantt-row-height': `${rowHeightPx.value}px`,
  '--gantt-row-element-height': `${GANTT_ROW_ELEMENT_HEIGHT_PX}px`,
  '--gantt-header-height': `${GANTT_HEADER_HEIGHT_PX}px`,
  '--gantt-container-top': `${GANTT_CONTAINER_TOP_PX}px`,
  '--gantt-chunk-width': `${TIMELINE_CHUNK_WIDTH_PX}px`,
}))
</script>

<template>
  <div
    :ref="setRootElement"
    role="region"
    aria-label="Gantt chart"
    tabindex="0"
    :class="styles.root"
    :style="rootStyle"
    @scroll.passive="onScroll"
  >
    <div
      :class="styles['virtualized-content-height']"
      :style="{ '--gantt-scroll-height': `${virtualizedHeightPx + GANTT_HEADER_HEIGHT_PX}px` }"
    >
      <div :class="styles.stuck" :style="{ '--gantt-visible-height': `${rootElementHeight}px` }">
        <div :class="styles.layout">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
