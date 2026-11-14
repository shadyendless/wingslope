<script setup lang="ts">
/**
 * A `GsSelectField` listing the carousel's items by title, labelled "Carousel item select".
 * Choosing an item makes it active. Must be used inside a `GsCarousel`.
 *
 * Other attributes and `GsSelectField` props (`label`, `description`, …) pass through to the
 * select; pass `aria-label` to relabel it.
 */
import type { AcceptableValue } from 'reka-ui'
import { computed } from 'vue'
import GsOption from '../options/GsOption.vue'
import GsSelectField from '../select-field/GsSelectField.vue'
import { useCarousel } from './context'
import styles from './styles.module.css'
import type { GsCarouselSelectProps } from './types'

const { size, disabled = undefined, classes } = defineProps<GsCarouselSelectProps>()

const carousel = useCarousel()
const current = computed(() => carousel.items[carousel.position])

const selectClasses = computed(() => ({
  ...classes?.select,
  trigger: [styles['gallery-select'], classes?.select?.trigger].filter(Boolean).join(' '),
}))

function select(value: AcceptableValue | AcceptableValue[] | undefined) {
  const index = carousel.items.findIndex((item) => item.id === value)
  if (index >= 0) carousel.setPosition(index)
}
</script>

<template>
  <GsSelectField
    aria-label="Carousel item select"
    :class="styles['gallery-select']"
    :classes="selectClasses"
    :size="size"
    :disabled="disabled"
    :model-value="current?.id"
    :placeholder="current?.title"
    @update:model-value="select"
  >
    <GsOption
      v-for="item in carousel.items"
      :key="item.id"
      :class="classes?.option"
      :value="item.id"
      :label="item.title"
    />
  </GsSelectField>
</template>
