<script setup lang="ts">
/** The title of a `GsHero`. Renders an `<h2>` unless `level` says otherwise. */
import { injectHeroContext } from './context'
import type { GsHeroTitleProps } from './types'

const { level = 2 } = defineProps<GsHeroTitleProps>()

defineSlots<{
  default?: () => unknown
}>()

const context = injectHeroContext()
</script>

<template>
  <component :is="`h${level}`" :class="context?.titleClass.value"><slot /></component>
</template>
