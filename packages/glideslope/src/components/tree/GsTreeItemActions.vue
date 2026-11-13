<script setup lang="ts">
/**
 * Buttons and status icons at the end of a `GsTree` row. Buttons inside are sized to the tree's
 * density, clicking them doesn't select or expand the row, and Tab reaches them only in the focused
 * row.
 *
 * @example
 * ```vue
 * <GsTreeItemActions>
 *   <GsButton variant="icon" aria-label="Center on"><GsIcon><CenterOnIcon /></GsIcon></GsButton>
 * </GsTreeItemActions>
 * ```
 */
import { useTemplateRef } from 'vue'
import { useRowTabStop } from '../../lib/use-row-tab-stop'
import { injectTreeItemTabStop, injectTreeVariant } from './context'
import styles from './styles.module.css'

defineSlots<{
  /** Action buttons and icons. */
  default?: () => unknown
}>()

const variant = injectTreeVariant()
const root = useTemplateRef<HTMLElement>('root')
// Outside a tree row (e.g. in docs) there is no tab stop to follow; leave the controls alone.
const isTabStop = injectTreeItemTabStop()
if (isTabStop) useRowTabStop(root, isTabStop)
</script>

<template>
  <!-- Clicks on actions belong to the actions, not to the row's selection. -->
  <div ref="root" :class="[styles.actions, styles[variant]]" @click.stop><slot /></div>
</template>
