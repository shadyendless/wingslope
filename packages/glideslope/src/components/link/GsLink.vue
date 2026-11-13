<script setup lang="ts">
/**
 * An inline text link. With `allows-visited`, it marks itself visited (`data-visited`) once
 * clicked, so visited links can be styled.
 *
 * @example
 * ```vue
 * Read the <GsLink href="/docs">documentation</GsLink>.
 *
 * <!-- With Vue Router -->
 * <GsLink as-child><RouterLink to="/docs">documentation</RouterLink></GsLink>
 * ```
 */
import { Primitive } from 'reka-ui'
import { computed } from 'vue'
import { useDisabledLink } from '../../lib/use-disabled-link'
import { injectLinkDefaults } from './defaults'
import styles from './styles.module.css'
import type { GsLinkProps } from './types'

const {
  as = 'a',
  asChild = false,
  href,
  disabled = false,
  allowsVisited = undefined,
} = defineProps<GsLinkProps>()

/**
 * Whether the link has been visited. It turns `true` when the link is clicked while
 * `allows-visited` is on; set it yourself (for example from your app's history) to show a link as
 * visited. It is only shown (as `data-visited`) while `allows-visited` is on.
 */
const visited = defineModel<boolean>('visited', { default: false })

defineSlots<{
  /** Link text. */
  default?: () => unknown
}>()

const defaults = injectLinkDefaults()
const resolvedAllowsVisited = computed(() => allowsVisited ?? defaults.value.allowsVisited ?? false)

const { linkAttrs, guardClick } = useDisabledLink(
  () => href,
  () => disabled,
)

function onClick(event: MouseEvent) {
  guardClick(event)
  if (!disabled && resolvedAllowsVisited.value) visited.value = true
}
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    v-bind="linkAttrs"
    :class="[styles.link, defaults.class]"
    :data-visited="resolvedAllowsVisited && visited ? '' : undefined"
    @click="onClick"
  >
    <slot />
  </Primitive>
</template>
