<script setup lang="ts">
/**
 * A self-updating `<time>` element showing the current time, in UTC by default. It updates at the
 * start of every second.
 *
 * The clock is **unstyled**: style it with classes.
 *
 * @example
 * ```vue
 * <GsClock />
 * <!-- <time>15:54:14 UTC</time> -->
 *
 * <GsClock class="fg-accent-primary-bold" />
 *
 * <GsClock :formatter="new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'long', timeZone: 'UTC', hour12: false })" />
 * <!-- <time>9/30/25, 15:54:14 UTC</time> -->
 * ```
 */
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { setClockInterval } from './clock-interval'
import type { GsClockProps } from './types'

const { formatter } = defineProps<GsClockProps>()

const DEFAULT_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeStyle: 'long',
  timeZone: 'UTC',
  hour12: false,
})

const now = shallowRef(Date.now())
const time = computed(() => (formatter ?? DEFAULT_FORMATTER).format(now.value))
const datetime = computed(() => new Date(now.value).toISOString())

let stop: (() => void) | undefined

onMounted(() => {
  now.value = Date.now()
  stop = setClockInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => stop?.())
</script>

<template>
  <!-- The server renders a different second than the client hydrates with. -->
  <time :datetime="datetime" data-allow-mismatch>{{ time }}</time>
</template>
