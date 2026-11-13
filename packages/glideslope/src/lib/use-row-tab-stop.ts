import { onMounted, onUpdated, watch, type Ref } from 'vue'

const FOCUSABLE = 'button, a[href], input, select, textarea, [tabindex]'

/**
 * Keeps the controls inside a composite widget's row (a list row's menu, a tree row's actions) out
 * of the tab order unless the row is the widget's roving tab stop, so Tab doesn't walk through
 * every row. Reka's `TagGroupItemDelete` does the same for its delete button.
 */
export function useRowTabStop(
  container: Readonly<Ref<HTMLElement | null>>,
  isTabStop: Ref<boolean>,
) {
  function sync() {
    const tabindex = isTabStop.value ? '0' : '-1'
    for (const el of container.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []) {
      el.setAttribute('tabindex', tabindex)
    }
  }

  onMounted(sync)
  // Slot content can change; re-apply after each render of the container's owner.
  onUpdated(sync)
  watch(isTabStop, sync, { flush: 'post' })
}
