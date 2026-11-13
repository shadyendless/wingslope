<script setup lang="ts">
/**
 * Dotted connector lines for hierarchical layouts such as trees and nested query rules.
 * Purely decorative, so it is hidden from assistive technology.
 */
import styles from './styles.module.css'
import type { GsLinesProps } from './types'

const { size = 'medium', variant = 'branch', visible = true } = defineProps<GsLinesProps>()
</script>

<template>
  <div
    :class="[styles.lines, styles[variant]]"
    :data-size="size"
    :data-hidden="visible ? undefined : ''"
    aria-hidden="true"
  />
</template>
