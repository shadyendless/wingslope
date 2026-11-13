<script setup lang="ts">
/** The status icon matching a notice color. Decorative: the message carries the meaning. */
import InformationIcon from '@wingbrace/glideslope-icons/information'
import ProblemIcon from '@wingbrace/glideslope-icons/problem'
import SuccessIcon from '@wingbrace/glideslope-icons/success'
import WarningIcon from '@wingbrace/glideslope-icons/warning'
import { computed } from 'vue'
import GsIcon from '../icon/GsIcon.vue'
import type { GsNoticeColor, GsNoticeSize } from './types'

const { color = 'info', size = 'medium' } = defineProps<{
  color?: GsNoticeColor
  size?: GsNoticeSize
}>()

const icon = computed(
  () =>
    ({
      info: InformationIcon,
      advisory: InformationIcon,
      normal: SuccessIcon,
      serious: WarningIcon,
      critical: ProblemIcon,
    })[color],
)
</script>

<template>
  <GsIcon :size="size === 'small' ? 'medium' : 'large'"><component :is="icon" /></GsIcon>
</template>
