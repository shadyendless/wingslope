<script setup lang="ts">
/** Closes the surrounding `GsDialog` when its child (usually a `GsButton`) is clicked. */
import { DialogClose } from 'reka-ui'

defineSlots<{
  /** A single clickable element. */
  default?: () => unknown
}>()
</script>

<template>
  <DialogClose as-child><slot /></DialogClose>
</template>
