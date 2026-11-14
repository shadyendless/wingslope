<script setup lang="ts">
/**
 * A link of a `GsSidenav`, usually to another application, marked with an outward arrow. Collapsed,
 * only its icon shows, and `text-value` appears as a tooltip.
 *
 * @example
 * ```vue
 * <GsSidenavLink href="https://example.com" target="_blank" text-value="Training">
 *   <GsIcon><BookIcon /></GsIcon>
 *   <GsSidenavText>Training</GsSidenavText>
 * </GsSidenavLink>
 * ```
 */
import ArrowNortheastIcon from '@wingbrace/glideslope-icons/arrow-northeast'
import { Primitive } from 'reka-ui'
import { computed, mergeProps } from 'vue'
import { useDisabledLink } from '../../lib/use-disabled-link'
import { provideIconDefaults } from '../icon/defaults'
import GsIcon from '../icon/GsIcon.vue'
import GsTooltip from '../tooltip/GsTooltip.vue'
import { injectSidenavContext, provideSidenavParts } from './context'
import styles from './styles.module.css'
import type { GsSidenavLinkProps } from './types'

// Attributes go to the link, not to the tooltip wrapping it.
defineOptions({ inheritAttrs: false })

const { href, textValue, disabled = false, as = 'a', classes } = defineProps<GsSidenavLinkProps>()

defineSlots<{
  /** A `GsIcon` and a `GsSidenavText` label. */
  default?: () => unknown
}>()

const sidenav = injectSidenavContext()
const { linkAttrs, guardClick } = useDisabledLink(
  () => href,
  () => disabled,
)

const tooltipClasses = computed(() => ({
  content: [styles.tooltip, disabled && styles.tooltipDisabled].filter(Boolean).join(' '),
}))

provideIconDefaults(() => ({ class: classes?.icon }))
provideSidenavParts(() => ({ text: [styles.text, styles.transient], interactive: true }))
</script>

<template>
  <GsTooltip side="right" :disabled="sidenav?.open.value ?? false" :classes="tooltipClasses">
    <template #trigger>
      <!-- The guard runs first, so a disabled link swallows the consumer's click handlers too. -->
      <Primitive
        :as="as"
        v-bind="mergeProps({ onClick: guardClick }, linkAttrs, $attrs)"
        :class="['group/link', styles.link, classes?.button]"
      >
        <slot />
        <GsIcon :class="styles.transient"><ArrowNortheastIcon /></GsIcon>
      </Primitive>
    </template>
    {{ textValue }}
    <GsIcon><ArrowNortheastIcon /></GsIcon>
  </GsTooltip>
</template>
