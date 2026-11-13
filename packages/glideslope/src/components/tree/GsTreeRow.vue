<script setup lang="ts" generic="T">
/**
 * @internal One row of a `GsTree`: the Reka UI tree item plus its visibility toggle, rule lines,
 * expand chevron, content and selection checkbox. `GsTree` renders one per visible node, whether
 * the nodes come from `items` or from `GsTreeItem` markup.
 */
import CheckIcon from '@wingbrace/glideslope-icons/check'
import ChevronDownIcon from '@wingbrace/glideslope-icons/chevron-down'
import ChevronRightIcon from '@wingbrace/glideslope-icons/chevron-right'
import HideIcon from '@wingbrace/glideslope-icons/hide'
import RemoveIcon from '@wingbrace/glideslope-icons/remove'
import ShowIcon from '@wingbrace/glideslope-icons/show'
import { TreeItem, injectTreeRootContext, type FlattenedItem, type TreeItemEmits } from 'reka-ui'
import { computed } from 'vue'
import { provideButtonDefaults } from '../button/defaults'
import GsButton from '../button/GsButton.vue'
import { provideIconDefaults } from '../icon/defaults'
import GsIcon from '../icon/GsIcon.vue'
import GsLines from '../lines/GsLines.vue'
import type { GsLinesProps } from '../lines/types'
import { injectTreeContext, provideTreeItemTabStop, provideTreeRowText } from './context'
import styles from './styles.module.css'
import type { GsTreeItemSlotProps, GsTreeNode } from './types'

const { item } = defineProps<{
  /** The flattened node from Reka UI's `TreeRoot`. */
  item: FlattenedItem<GsTreeNode<T>>
}>()

defineSlots<{
  default?: (props: GsTreeItemSlotProps<T>) => unknown
}>()

type TreeItemEvent = TreeItemEmits<GsTreeNode<T>>['select'][0]

const context = injectTreeContext()
if (!context) throw new Error('GsTreeRow must be rendered by GsTree')
const tree = context
const root = injectTreeRootContext()

const node = computed(() => item.value)
const variant = computed(() => tree.variant.value)
const size = computed(() => (variant.value === 'cozy' ? 'medium' : 'small'))
const selectable = computed(() => tree.selectionMode.value !== 'none')

const state = computed(() => {
  const { key } = node.value
  return {
    expanded: root.expanded.value.includes(key),
    selected: root.selectedKeys.value.includes(key),
    indeterminate: tree.isIndeterminate(key),
    disabled: tree.isDisabled(key),
    visible: tree.isVisible(key),
    viewable: tree.isViewable(key),
  }
})

const slotProps = computed<GsTreeItemSlotProps<T>>(() => ({
  ...state.value,
  node: node.value,
  level: item.level,
  hasChildren: item.hasChildren,
  variant: variant.value,
}))

/**
 * One connector per level below the root: `vert` columns continue each ancestor's line (hidden
 * once that ancestor is the last of its siblings), and the final column joins this node.
 */
const lines = computed(() => {
  const { level } = item
  if (level <= 1) return []
  const layout = tree.layout.value.get(node.value.key)
  return Array.from({ length: level }, (_, index) => {
    const own = index === level - 1
    const kind: GsLinesProps['variant'] = own ? (layout?.last ? 'last' : 'branch') : 'vert'
    const hidden = !own && (layout?.ancestorsLast[index] ?? false)
    return { kind, visible: tree.showRuleLines.value && !hidden }
  })
})
const lineSize = computed(() => (variant.value === 'crammed' ? 'medium' : 'large'))

function onSelect(event: TreeItemEvent) {
  // GsTree owns the selection so it can cascade and skip disabled nodes.
  event.preventDefault()
  if (selectable.value) tree.select(node.value.key)
  else if (event.detail.originalEvent.type === 'keydown') root.onToggle(node.value)
}

function onToggle(event: TreeItemEvent) {
  // With selection, a row click selects and only the chevron or arrow keys expand.
  if (selectable.value && event.detail.originalEvent.type === 'click') event.preventDefault()
}

function onChevronClick(event: MouseEvent) {
  ;(event.currentTarget as HTMLElement).closest<HTMLElement>('[role="treeitem"]')?.focus()
  root.onToggle(node.value)
}

const textIds = provideTreeRowText()
const isTabStop = computed(() => tree.tabStopKey.value === node.value.key)
provideTreeItemTabStop(isTabStop)

provideIconDefaults(() => ({ size: size.value }))
provideButtonDefaults(() => ({ size: size.value }))
</script>

<template>
  <TreeItem
    v-bind="item.bind"
    :disabled="state.disabled"
    :aria-label="textIds.length ? undefined : node.label"
    :aria-labelledby="textIds.length ? textIds.join(' ') : undefined"
    :class="['group/tree-item', styles.item, styles[variant]]"
    :data-visible="state.visible ? '' : undefined"
    :data-viewable="state.viewable ? '' : undefined"
    :data-indeterminate="state.indeterminate ? '' : undefined"
    @select="onSelect"
    @toggle="onToggle"
    @focusin="tree.tabStopKey.value = node.key"
  >
    <!-- The row is named by its GsTreeItemLabel / GsTreeItemDescription, falling back to
         node.label, so the names of buttons inside it don't become part of its name. -->
    <div :class="[styles.content, styles[variant]]">
      <GsButton
        v-if="tree.showVisibility.value"
        variant="icon"
        color="mono-bold"
        :size="size"
        :disabled="state.disabled"
        :aria-label="`${state.visible ? 'Hide' : 'Show'} ${node.label}`"
        :tabindex="isTabStop ? 0 : -1"
        :class="styles.visibility"
        @click.stop="tree.toggleVisibility(node.key)"
      >
        <GsIcon>
          <ShowIcon v-if="state.visible" />
          <HideIcon v-else />
        </GsIcon>
      </GsButton>
      <GsLines
        v-for="(line, index) in lines"
        :key="index"
        :variant="line.kind"
        :size="lineSize"
        :visible="line.visible"
        :class="[styles.spacing, styles[variant]]"
      />
      <!-- Pointer affordance only: the arrow keys expand, and aria-expanded announces the state. -->
      <GsButton
        v-if="item.hasChildren"
        variant="icon"
        color="mono-bold"
        :size="size"
        :disabled="state.disabled"
        tabindex="-1"
        aria-hidden="true"
        :class="styles.expansion"
        @mousedown.prevent
        @click.stop="onChevronClick"
      >
        <GsIcon>
          <ChevronDownIcon v-if="state.expanded" />
          <ChevronRightIcon v-else />
        </GsIcon>
      </GsButton>
      <div :class="[styles.display, styles[variant]]">
        <slot v-bind="slotProps" />
      </div>
      <!-- Decorative: the row's aria-selected carries the state. -->
      <span
        v-if="selectable"
        :class="styles.selection"
        :data-state="
          state.indeterminate ? 'indeterminate' : state.selected ? 'checked' : 'unchecked'
        "
        aria-hidden="true"
      >
        <GsIcon size="small">
          <RemoveIcon v-if="state.indeterminate" />
          <CheckIcon v-else-if="state.selected" />
        </GsIcon>
      </span>
      <!-- A drag handle for reordering will go here once a Vue drag-and-drop library is chosen. -->
    </div>
  </TreeItem>
</template>
