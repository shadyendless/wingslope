import { computed, toValue, type MaybeRefOrGetter } from 'vue'

/**
 * Attributes and a click guard for anchors that can be disabled.
 *
 * Anchors have no native `disabled` state, so a disabled link drops its `href`, leaves the tab
 * order, is announced as disabled, and swallows clicks (including the consumer's `@click`, because
 * Vue skips remaining handlers after `stopImmediatePropagation`).
 */
export function useDisabledLink(
  href: MaybeRefOrGetter<string | undefined>,
  disabled: MaybeRefOrGetter<boolean>,
) {
  const linkAttrs = computed(() =>
    toValue(disabled)
      ? { 'aria-disabled': 'true', 'data-disabled': '', tabindex: -1 }
      : { href: toValue(href) },
  )

  function guardClick(event: MouseEvent) {
    if (!toValue(disabled)) return
    event.preventDefault()
    event.stopImmediatePropagation()
  }

  return { linkAttrs, guardClick }
}
