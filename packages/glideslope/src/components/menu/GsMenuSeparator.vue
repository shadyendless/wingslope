<script setup lang="ts">
/** A divider between groups of menu items. */
import { injectMenuContext, menuParts } from './context'
import styles from './styles.module.css'

const parts = menuParts[injectMenuContext().kind]
</script>

<template>
  <component :is="parts.Separator" :class="styles.separator" />
</template>
