<script setup lang="ts">
/**
 * One step in `GsBreadcrumbs`. With `href` it is a link; the `current` item is plain text marked
 * `aria-current="page"`. Use `as-child` to render a router link instead of an anchor.
 */
import ChevronRightIcon from '@wingbrace/glideslope-icons/chevron-right'
import { Primitive } from 'reka-ui'
import GsIcon from '../icon/GsIcon.vue'
import styles from './styles.module.css'
import type { GsBreadcrumbItemProps } from './types'

const {
  href = undefined,
  current = false,
  asChild = false,
  classes,
} = defineProps<GsBreadcrumbItemProps>()

defineSlots<{
  /** Item text, or the link element when `as-child` is set. */
  default?: () => unknown
}>()
</script>

<template>
  <li :class="['group/breadcrumb', styles.item]" :aria-current="current ? 'page' : undefined">
    <span v-if="current"><slot /></span>
    <Primitive
      v-else-if="href || asChild"
      as="a"
      :href="href"
      :as-child="asChild"
      :class="[styles.link, classes?.link]"
    >
      <slot />
    </Primitive>
    <slot v-else />
    <GsIcon
      v-if="!current"
      size="small"
      :class="[styles.separator, classes?.separator]"
      aria-hidden="true"
    >
      <ChevronRightIcon />
    </GsIcon>
  </li>
</template>
