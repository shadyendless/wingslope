<script setup lang="ts">
/**
 * A collapsible side navigation, used as a direct child of a `GsDrawerLayout`. Collapsed, it shows
 * a rail of icons with tooltips; open, it shows their labels too. Open and close it with its
 * `GsSidenavHeader`, a `GsSidenavTrigger`, `useSidenavs()` from anywhere, or `v-model:open`.
 *
 * Renders a `<nav>` landmark; name it with `aria-label`.
 *
 * @example
 * ```vue
 * <GsDrawerLayout push="left">
 *   <GsDrawerLayoutMain>
 *     <GsSidenavTrigger for="app-nav">
 *       <GsButton variant="icon" aria-label="Navigation"><GsIcon><MenuIcon /></GsIcon></GsButton>
 *     </GsSidenavTrigger>
 *   </GsDrawerLayoutMain>
 *   <GsSidenav id="app-nav" aria-label="Main">
 *     <GsSidenavHeader>…</GsSidenavHeader>
 *     <GsSidenavContent>…</GsSidenavContent>
 *   </GsSidenav>
 * </GsDrawerLayout>
 * ```
 */
import { computed, onScopeDispose, shallowRef, watch } from 'vue'
import { provideSidenavContext, provideSidenavParts } from './context'
import styles from './styles.module.css'
import type { GsSidenavProps } from './types'
import { joinSidenav, leaveSidenav } from './use-sidenavs'

const { id, hiddenWhenClosed = false } = defineProps<GsSidenavProps>()

/** Whether the sidenav is open. Kept in sync with `useSidenavs()` and the triggers. */
const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  /** A `GsSidenavHeader`, `GsSidenavContent` and `GsSidenavFooter`. */
  default?: () => unknown
}>()

const record = shallowRef(joinSidenav(id, open.value))
watch(
  () => id,
  (next, previous) => {
    leaveSidenav(previous)
    record.value = joinSidenav(next, record.value.open.value)
  },
)
onScopeDispose(() => leaveSidenav(id))

const isOpen = computed(() => record.value.open.value)
watch(isOpen, (value) => (open.value = value), { immediate: true })
watch(open, (value) => (record.value.open.value = value))

provideSidenavContext({ id: computed(() => id), open: isOpen })
provideSidenavParts(() => ({ heading: [styles.heading, styles.transient] }))
</script>

<template>
  <nav
    v-if="isOpen || !hiddenWhenClosed"
    :id="id"
    :class="['group/sidenav', styles.sidenav]"
    :data-state="isOpen ? 'open' : 'closed'"
  >
    <slot />
  </nav>
</template>
