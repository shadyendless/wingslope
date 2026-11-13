<script setup lang="ts">
/** The heading of a `GsDialog`; it names the dialog for assistive technology. Required. */
import { DialogTitle } from 'reka-ui'
import styles from './styles.module.css'

defineSlots<{
  default?: () => unknown
}>()
</script>

<template>
  <DialogTitle :class="styles.title"><slot /></DialogTitle>
</template>
