<script setup lang="ts">
/**
 * Moves between pages of results. Bind the current page (1-based) with `v-model`, or set
 * `default-value` to start an uncontrolled pagination on another page. Shows up to five page
 * buttons around the current page, plus previous and next.
 *
 * @example
 * ```vue
 * <GsPagination v-model="page" :total="12" />
 * ```
 */
import ChevronLeftIcon from '@wingbrace/glideslope-icons/chevron-left'
import ChevronRightIcon from '@wingbrace/glideslope-icons/chevron-right'
import {
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
  PaginationRoot,
} from 'reka-ui'
import GsButton from '../button/GsButton.vue'
import buttonStyles from '../button/styles.module.css'
import GsIcon from '../icon/GsIcon.vue'
import styles from './styles.module.css'
import type { GsPaginationProps } from './types'

const { total, loading = false, classes } = defineProps<GsPaginationProps>()

/** Current page, starting at 1. Without `v-model`, starts at `default-value`. */
const page = defineModel<number>({
  default: (props: Record<string, unknown>) => (props.defaultValue as number | undefined) ?? 1,
})
</script>

<template>
  <PaginationRoot
    v-model:page="page"
    :total="total"
    :items-per-page="1"
    :sibling-count="2"
    :aria-label="`Page ${page} of ${total}`"
    :class="styles.container"
  >
    <!-- `as="template"` keeps the buttons direct children of the <nav>, so its class lays them out. -->
    <PaginationList v-slot="{ items }" as="template">
      <PaginationPrev as-child>
        <GsButton
          variant="icon"
          color="mono-bold"
          aria-label="Previous page"
          :class="classes?.prev"
        >
          <GsIcon><ChevronLeftIcon /></GsIcon>
        </GsButton>
      </PaginationPrev>
      <template v-if="!loading">
        <template v-for="(item, index) in items" :key="index">
          <PaginationListItem v-if="item.type === 'page'" :value="item.value" as-child>
            <GsButton
              variant="flat"
              color="accent"
              :class="[buttonStyles.toggle, styles.button, classes?.pages]"
              :aria-label="`Page ${item.value}`"
            >
              {{ item.value }}
            </GsButton>
          </PaginationListItem>
        </template>
      </template>
      <PaginationNext as-child>
        <GsButton variant="icon" color="mono-bold" aria-label="Next page" :class="classes?.next">
          <GsIcon><ChevronRightIcon /></GsIcon>
        </GsButton>
      </PaginationNext>
    </PaginationList>
  </PaginationRoot>
</template>
