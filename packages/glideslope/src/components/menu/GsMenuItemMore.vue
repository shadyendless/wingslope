<script setup lang="ts">
/**
 * @internal The chevron at the end of a submenu's item. It provides its own icon defaults, so the
 * `icon` class meant for the item's slot icons doesn't reach it.
 */
import ChevronRightIcon from '@wingbrace/glideslope-icons/chevron-right'
import GsIcon from '../icon/GsIcon.vue'
import { provideIconDefaults } from '../icon/defaults'
import styles from './styles.module.css'

const { iconClass = undefined } = defineProps<{ iconClass?: string }>()

provideIconDefaults(() => ({
  size: 'small',
  class: [styles.more, iconClass].filter(Boolean).join(' '),
}))
</script>

<template>
  <GsIcon><ChevronRightIcon /></GsIcon>
</template>
