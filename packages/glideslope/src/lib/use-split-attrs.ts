import { computed, useAttrs } from 'vue'

/**
 * Splits fallthrough attributes between a component's root and its form control.
 *
 * Field components set `inheritAttrs: false` and use this so that `class` and `style` style the
 * outer wrapper, while everything else (`id`, `name`, `autocomplete`, `aria-*`, listeners such as
 * `@focus`) reaches the actual `<input>` where it means something.
 */
export function useSplitAttrs() {
  const attrs = useAttrs()

  const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }))
  const controlAttrs = computed(() => {
    const { class: _class, style: _style, ...rest } = attrs
    return rest
  })

  return { rootAttrs, controlAttrs }
}
