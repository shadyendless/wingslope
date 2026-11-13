<script setup lang="ts">
/** Closes the surrounding `GsPopover` when its child (usually a `GsButton`) is clicked. */
import { PopoverClose } from 'reka-ui'

defineSlots<{
  /** A single clickable element. */
  default?: () => unknown
}>()
</script>

<template>
  <PopoverClose as-child><slot /></PopoverClose>
</template>
