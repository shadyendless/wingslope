<script setup lang="ts">
/** Supporting text below a `GsHero` title. */
import { injectHeroContext } from './context'

defineSlots<{
  default?: () => unknown
}>()

const context = injectHeroContext()
</script>

<template>
  <p :class="context?.subtitleClass.value"><slot /></p>
</template>
