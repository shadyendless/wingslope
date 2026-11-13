<script setup lang="ts">
/**
 * A menu item that opens a nested menu. Arrow Right (or hover) opens it, Arrow Left closes it.
 * Works in `GsMenu` and `GsContextMenu`; `GsMenuItem`s inside report their `value` to the outer
 * menu's `action` event.
 *
 * @example
 * ```vue
 * <GsMenuSubmenu label="Export as">
 *   <GsMenuItem value="csv" label="CSV" />
 *   <GsMenuItem value="kml" label="KML" />
 * </GsMenuSubmenu>
 * ```
 */
import { injectMenuContext, menuParts } from './context'
import GsMenuItemContent from './GsMenuItemContent.vue'
import styles from './styles.module.css'
import type { GsMenuSubmenuProps } from './types'

const { label, disabled = false, color = 'info', classes } = defineProps<GsMenuSubmenuProps>()

/** Open state of the nested menu. */
const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  /** Extra content of the item that opens the submenu, such as an icon. */
  trigger?: () => unknown
  /** The nested menu's items. */
  default?: () => unknown
}>()

const menu = injectMenuContext()
const parts = menuParts[menu.kind]
</script>

<template>
  <component :is="parts.Sub" v-model:open="open">
    <component
      :is="parts.SubTrigger"
      :disabled="disabled"
      :text-value="label"
      :class="['group/menu-item', styles.item, styles[menu.variant.value]]"
      :data-color="color"
    >
      <GsMenuItemContent :label="label" :classes="classes" submenu>
        <slot name="trigger" />
      </GsMenuItemContent>
    </component>
    <component :is="parts.Portal">
      <component
        :is="parts.SubContent"
        :side-offset="2"
        :class="[
          'group/menu',
          styles.popover,
          styles.menu,
          styles[menu.variant.value],
          classes?.popover,
        ]"
      >
        <slot />
      </component>
    </component>
  </component>
</template>
