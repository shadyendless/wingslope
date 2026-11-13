<script setup lang="ts">
/**
 * A short label shown when the trigger is hovered or focused. Bind `v-model:open` to control it.
 *
 * The trigger goes in the `trigger` slot and must be focusable (usually a button). Built on Reka
 * UI's `Tooltip`; place a `GsTooltipProvider` near the app root so moving between tooltips skips
 * the delay.
 *
 * @example
 * ```vue
 * <GsTooltip>
 *   <template #trigger>
 *     <GsButton variant="icon" aria-label="Settings"><GsIcon><SettingsIcon /></GsIcon></GsButton>
 *   </template>
 *   Settings
 * </GsTooltip>
 * ```
 */
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  injectTooltipProviderContext,
} from 'reka-ui'
import type { FunctionalComponent } from 'vue'
import styles from './styles.module.css'
import type { GsTooltipProps } from './types'

// Attributes go to the trigger, the only element rendered in place (the content is portalled).
// That lets another overlay wrap this one: its trigger attributes and listeners reach the button.
defineOptions({ inheritAttrs: false })

const {
  side = 'bottom',
  align = 'center',
  offset = 4,
  delay = 250,
  disabled = false,
  portalTo,
} = defineProps<GsTooltipProps>()

/** Open state. */
const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  /** The focusable element the tooltip describes. */
  trigger?: () => unknown
  /** Tooltip text. */
  default?: () => unknown
}>()

/** Reka UI requires a provider; create one only when the app hasn't. */
const Passthrough: FunctionalComponent = (_, { slots }) => slots.default?.()
const Provider = injectTooltipProviderContext(null) ? Passthrough : TooltipProvider
</script>

<template>
  <component :is="Provider">
    <TooltipRoot v-model:open="open" :delay-duration="delay" :disabled="disabled">
      <TooltipTrigger as-child v-bind="$attrs">
        <slot name="trigger" />
      </TooltipTrigger>
      <TooltipPortal :to="portalTo">
        <TooltipContent :side="side" :align="align" :side-offset="offset" :class="styles.tooltip">
          <slot />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </component>
</template>
