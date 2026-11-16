/**
 * @internal The Design Toolkit's `RowsVirtualizerRoot`, as a composable returning its render
 * function, shared by the panel and content row virtualizers.
 *
 * The virtualizers are render functions rather than SFCs because they read their default slot as
 * an array of rows (to count them and render only the visible slice), as the Design Toolkit does
 * with `children`.
 */
import { computed, h, type VNodeArrayChildren } from 'vue'
import { useRenderedRows } from './composables/use-rendered-rows'
import { useRootElementHeight } from './composables/use-root-element-height'
import { GANTT_HEADER_HEIGHT_PX } from './constants'
import styles from './styles.module.css'

interface RowsVirtualizerRootOptions {
  /** `list` on the panel side, whose rows are list items. */
  role?: 'list'
  /** Width of the whole timeline, on the content side. */
  widthPx?: number
}

export function useRowsVirtualizerRoot() {
  const rootElementHeight = useRootElementHeight()
  const heightPx = computed(() => rootElementHeight.value - GANTT_HEADER_HEIGHT_PX)
  const { rowsCount, render: renderRows } = useRenderedRows({ heightPx })

  function render(children: VNodeArrayChildren, { role, widthPx }: RowsVirtualizerRootOptions) {
    const { height, renderedRows } = renderRows(children)

    return h(
      'div',
      {
        class: styles['rows-virtualizer'],
        style: widthPx === undefined ? undefined : { '--gantt-timeline-width': `${widthPx}px` },
      },
      [
        h(
          'div',
          {
            class: styles['rows-virtualizer-rows'],
            style: { '--gantt-rows-height': `${height}px` },
            role,
          },
          renderedRows,
        ),
      ],
    )
  }

  return { rowsCount, render }
}
