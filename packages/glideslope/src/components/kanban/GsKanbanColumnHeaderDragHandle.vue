<script setup lang="ts">
/**
 * A grip icon for a column's header. It is decorative: columns can't be reordered by dragging (nor
 * can they in the Design Toolkit, which this matches).
 */
import DragVertIcon from '@wingbrace/glideslope-icons/drag-vert'
import GsIcon from '../icon/GsIcon.vue'
</script>

<template>
  <GsIcon size="small" aria-hidden="true"><DragVertIcon /></GsIcon>
</template>
