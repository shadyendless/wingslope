<script setup lang="ts">
/**
 * The header of a `GsSidenav`: a button, usually holding a `GsSidenavAvatar`, that opens and closes
 * the sidenav. Renders a `<header>`.
 *
 * @example
 * ```vue
 * <GsSidenavHeader>
 *   <GsSidenavAvatar>
 *     <GsIcon><AppLogo /></GsIcon>
 *     <GsSidenavHeading>Application</GsSidenavHeading>
 *     <GsSidenavText>Mission planning</GsSidenavText>
 *   </GsSidenavAvatar>
 * </GsSidenavHeader>
 * ```
 */
import ChevronLeftIcon from '@wingbrace/glideslope-icons/chevron-left'
import GsIcon from '../icon/GsIcon.vue'
import { injectSidenavContext, provideSidenavParts } from './context'
import styles from './styles.module.css'
import type { GsSidenavHeaderProps } from './types'
import { useSidenavs } from './use-sidenavs'

const { classes } = defineProps<GsSidenavHeaderProps>()

defineSlots<{
  /** The button's content, typically a `GsSidenavAvatar`. */
  default?: () => unknown
}>()

const sidenav = injectSidenavContext()
const sidenavs = useSidenavs()

function toggle() {
  if (sidenav) sidenavs.toggle(sidenav.id.value)
}

provideSidenavParts(() => ({ interactive: true }))
</script>

<template>
  <header :class="[styles.header, classes?.header]">
    <button
      type="button"
      :class="[styles.toggle, classes?.button]"
      :aria-expanded="sidenav?.open.value ?? false"
      :aria-controls="sidenav?.id.value"
      @click="toggle"
    >
      <slot />
      <GsIcon :class="[styles.transient, classes?.icon]"><ChevronLeftIcon /></GsIcon>
    </button>
  </header>
</template>
