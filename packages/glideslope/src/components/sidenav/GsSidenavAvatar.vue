<script setup lang="ts">
/**
 * An identity block for a `GsSidenav`'s header or footer: a `GsIcon` or `GsAvatar`, a
 * `GsSidenavHeading` and a `GsSidenavText`. Collapsed, only the icon or avatar shows.
 *
 * @example
 * ```vue
 * <GsSidenavAvatar>
 *   <GsAvatar src="/me.jpg" alt="Jo Doe" />
 *   <GsSidenavHeading>Jo Doe</GsSidenavHeading>
 *   <GsSidenavText>Mission commander</GsSidenavText>
 * </GsSidenavAvatar>
 * ```
 */
import { provideAvatarDefaults } from '../avatar/defaults'
import { provideIconDefaults } from '../icon/defaults'
import { injectSidenavParts, provideSidenavParts } from './context'
import styles from './styles.module.css'

defineSlots<{
  /** A `GsIcon` or `GsAvatar`, a `GsSidenavHeading` and a `GsSidenavText`. */
  default?: () => unknown
}>()

const parts = injectSidenavParts()

provideIconDefaults({ size: 'large', class: styles.avatarIcon })
provideAvatarDefaults({ class: styles.avatarIcon })
provideSidenavParts(() => ({
  heading: [styles.avatarHeading, styles.transient],
  text: [styles.avatarText, styles.transient],
}))
</script>

<template>
  <!-- Inside a button (the header, an item), only phrasing content is allowed. -->
  <component :is="parts.interactive ? 'span' : 'div'" :class="styles.avatar">
    <slot />
  </component>
</template>
