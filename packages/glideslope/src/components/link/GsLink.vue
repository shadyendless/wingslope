<script setup lang="ts">
/**
 * An inline text link.
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
import { useDisabledLink } from '../../lib/use-disabled-link'
import styles from './styles.module.css'
import type { GsLinkProps } from './types'

const { as = 'a', asChild = false, href, disabled = false } = defineProps<GsLinkProps>()

defineSlots<{
  /** Link text. */
  default?: () => unknown
}>()

const { linkAttrs, guardClick } = useDisabledLink(
  () => href,
  () => disabled,
)
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    v-bind="linkAttrs"
    :class="styles.link"
    @click="guardClick"
  >
    <slot />
  </Primitive>
</template>
