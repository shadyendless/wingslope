<script setup lang="ts">
/**
 * A group of `GsSidenavMenuItem`s under a title. While the sidenav is open, the title expands and
 * collapses the items in place; while it is collapsed, the menu's icon opens them in a panel beside
 * the rail. Bind the expanded state with `v-model:expanded`.
 *
 * @example
 * ```vue
 * <GsSidenavMenu title="Settings">
 *   <template #icon><GsIcon><SettingsIcon /></GsIcon></template>
 *   <GsSidenavMenuItem><GsSidenavText>Profile</GsSidenavText></GsSidenavMenuItem>
 *   <GsSidenavMenuItem><GsSidenavText>Security</GsSidenavText></GsSidenavMenuItem>
 * </GsSidenavMenu>
 * ```
 */
import ChevronDownIcon from '@wingbrace/glideslope-icons/chevron-down'
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from 'reka-ui'
import { computed, useId } from 'vue'
import GsIcon from '../icon/GsIcon.vue'
import GsPopover from '../popover/GsPopover.vue'
import GsPopoverTitle from '../popover/GsPopoverTitle.vue'
import GsTooltip from '../tooltip/GsTooltip.vue'
import { injectSidenavContext, provideSidenavMenuItemClass, provideSidenavParts } from './context'
import styles from './styles.module.css'
import type { GsSidenavMenuProps } from './types'

// Attributes go to the button that expands the menu or opens its panel.
defineOptions({ inheritAttrs: false })

const { title, classes } = defineProps<GsSidenavMenuProps>()

/** Whether the items show under the title while the sidenav is open. */
const expanded = defineModel<boolean>('expanded', { default: false })

defineSlots<{
  /** The menu's `GsIcon`, shown in both states. */
  icon?: () => unknown
  /** `GsSidenavMenuItem`s. */
  default?: () => unknown
}>()

const sidenav = injectSidenavContext()
const open = computed(() => sidenav?.open.value ?? false)
const triggerId = useId()
const popoverClass = computed(() => [styles.panel, classes?.popoverPanel].filter(Boolean).join(' '))

provideSidenavMenuItemClass(computed(() => (open.value ? styles.menuItem : styles.panelItem)))
provideSidenavParts(() => ({ text: [] }))
</script>

<template>
  <CollapsibleRoot
    v-if="open"
    v-model:open="expanded"
    :class="['group/menu', styles.menu, classes?.menu]"
  >
    <CollapsibleTrigger :id="triggerId" :class="[styles.trigger, classes?.button]" v-bind="$attrs">
      <slot name="icon" />
      <span :class="[styles.menuHeading, styles.transient]">{{ title }}</span>
      <GsIcon :class="[styles.transient, classes?.icon]">
        <ChevronDownIcon :class="styles.triggerChevron" />
      </GsIcon>
    </CollapsibleTrigger>
    <CollapsibleContent role="group" :aria-labelledby="triggerId" :class="classes?.disclosurePanel">
      <div :class="[styles.content, classes?.panelContent]"><slot /></div>
    </CollapsibleContent>
  </CollapsibleRoot>
  <GsPopover v-else side="right" align="start" :classes="{ popover: popoverClass }">
    <template #trigger>
      <GsTooltip side="right" :classes="{ content: styles.tooltip }">
        <template #trigger>
          <button
            type="button"
            :class="[styles.trigger, classes?.button]"
            :aria-label="title"
            v-bind="$attrs"
          >
            <slot name="icon" />
          </button>
        </template>
        {{ title }}
      </GsTooltip>
    </template>
    <GsPopoverTitle :level="3" :class="styles.panelHeading">{{ title }}</GsPopoverTitle>
    <div :class="[styles.panelContent, classes?.panelContent]"><slot /></div>
  </GsPopover>
</template>
