<script setup lang="ts">
import { useTheme } from '@wingbrace/glideslope'
import { useTemplateRef, watchEffect } from 'vue'

const { tokens } = useTheme()
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

const names = ['surface default', 'accent primary', 'normal', 'serious', 'critical'] as const

watchEffect(() => {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return
  const { bg } = tokens.value
  const colors = [
    bg.surface.default,
    bg.accent.primary.bold,
    bg.normal.bold,
    bg.serious.bold,
    bg.critical.bold,
  ]
  colors.forEach(([r, g, b, a], i) => {
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`
    ctx.fillRect(i * 64, 0, 56, 40)
  })
})
</script>

<template>
  <div class="flex flex-col gap-xs">
    <canvas
      ref="canvas"
      width="320"
      height="40"
      :aria-label="`Theme colors: ${names.join(', ')}`"
    />
  </div>
</template>
