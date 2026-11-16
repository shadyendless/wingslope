import {
  cloneVNode,
  Comment,
  computed,
  Fragment,
  isVNode,
  onMounted,
  onUpdated,
  shallowRef,
  Text,
  toValue,
  type MaybeRefOrGetter,
  type Ref,
  type VNode,
  type VNodeArrayChildren,
} from 'vue'
import { injectGanttContext } from '../context'
import { injectGanttStore, selectors } from '../store'
import { deriveRenderedSlice } from '../utils/layout'
import { useScrollbarHeight } from './use-scrollbar-height'

/**
 * The rows in a container's default slot: `v-for` fragments flattened, and comments (a `v-if`
 * that is false) and whitespace dropped. The Design Toolkit's `Children.toArray`.
 */
export function toRows(children: VNodeArrayChildren): VNode[] {
  const rows: VNode[] = []

  for (const child of children) {
    if (Array.isArray(child)) {
      rows.push(...toRows(child))
    } else if (isVNode(child)) {
      if (child.type === Fragment) {
        rows.push(...toRows((child.children ?? []) as VNodeArrayChildren))
      } else if (
        child.type !== Comment &&
        !(child.type === Text && typeof child.children === 'string' && !child.children.trim())
      ) {
        rows.push(child)
      }
    }
  }

  return rows
}

export interface UseRenderedRowsOptions {
  /** Height of the visible rows region, in pixels. */
  heightPx: MaybeRefOrGetter<number>
}

export interface RenderedRows {
  /** Height of all rows plus the horizontal scrollbar, in pixels. */
  height: number
  /** The rows to render, positioned absolutely at their place among all rows. */
  renderedRows: VNode[]
}

export interface UseRenderedRowsValue {
  /** The number of rows, as of the last render. */
  rowsCount: Readonly<Ref<number>>
  /** Call in the render function, with the default slot's content. */
  render: (children: VNodeArrayChildren) => RenderedRows
}

/**
 * Vertical virtualization: renders only the rows in view (plus overscan) out of all the rows in a
 * container's slot, each positioned with a `translateY` at its place among all rows.
 *
 * The slot is read in the render function, as the Design Toolkit reads `children`; only the
 * visible slice is mounted. The total height is written to the store after rendering (the Design
 * Toolkit's `useEffect`), where `GsGantt` uses it for the scroll range. The rendered slice only
 * changes when the scroll crosses a row (`roundedCurrentRowScrollPx`).
 */
export function useRenderedRows({ heightPx }: UseRenderedRowsOptions): UseRenderedRowsValue {
  const { rowHeightPx } = injectGanttContext()
  const store = injectGanttStore()
  const roundedCurrentRowScrollPx = computed(() =>
    selectors.roundedCurrentRowScrollPx(rowHeightPx.value)(store.state),
  )
  const horizontalScrollbarHeight = useScrollbarHeight()
  const rowsCount = shallowRef(0)
  const slice = computed(() =>
    deriveRenderedSlice(roundedCurrentRowScrollPx.value, rowHeightPx.value, toValue(heightPx)),
  )

  let renderedCount = 0
  let renderedHeight = 0

  // Sets the total virtualized height in the store so that it can be used for the chart's
  // overflow management.
  const sync = () => {
    rowsCount.value = renderedCount
    store.setVirtualizedHeightPx(renderedHeight)
  }
  onMounted(sync)
  onUpdated(sync)

  function render(children: VNodeArrayChildren): RenderedRows {
    const allRows = toRows(children)
    const { start, end } = slice.value
    const rowHeight = rowHeightPx.value

    renderedCount = allRows.length
    renderedHeight = allRows.length * rowHeight + horizontalScrollbarHeight.value

    return {
      height: renderedHeight,
      renderedRows: allRows.slice(start, end).map((row, index) =>
        cloneVNode(row, {
          style: {
            position: 'absolute',
            transform: `translateY(${rowHeight * (start + index)}px)`,
            width: '100%',
          },
        }),
      ),
    }
  }

  return { rowsCount, render }
}
