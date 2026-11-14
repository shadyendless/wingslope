<script setup lang="ts">
/**
 * The main area of a `GsSidenav`: section `GsSidenavHeading`s, `GsSidenavItem`s, `GsSidenavLink`s,
 * `GsSidenavMenu`s and `GsDivider`s.
 *
 * @example
 * ```vue
 * <GsSidenavContent>
 *   <GsSidenavHeading>Views</GsSidenavHeading>
 *   <GsSidenavItem text-value="Map"><GsIcon><MapIcon /></GsIcon><GsSidenavText>Map</GsSidenavText></GsSidenavItem>
 *   <GsDivider />
 * </GsSidenavContent>
 * ```
 */
import { provideDividerDefaults } from '../divider/defaults'
import styles from './styles.module.css'

defineSlots<{
  /** Headings, items, links, menus and dividers. */
  default?: () => unknown
}>()

provideDividerDefaults({ class: styles.divider })
</script>

<template>
  <div :class="styles.content"><slot /></div>
</template>
