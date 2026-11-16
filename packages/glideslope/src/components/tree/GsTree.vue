<script setup lang="ts" generic="T">
/**
 * A hierarchical list with keyboard navigation, selection (optionally cascading through
 * descendants), expansion and per-row visibility toggles. Give it an accessible name with
 * `aria-label` or `aria-labelledby`.
 *
 * Pass nodes as `items` and render each row's content in the default slot with
 * `GsTreeItemPrefixIcon`, `GsTreeItemLabel`, `GsTreeItemDescription` and `GsTreeItemActions`. Or,
 * for a hard-coded tree, leave out `items` and write nested `GsTreeItem`s in the default slot.
 * Selected, expanded and visible nodes are arrays of keys bound with `v-model`, `v-model:expanded`
 * and `v-model:visible`; without a binding, they start from the nodes' `selected`, `expanded` and
 * `visible` flags. `useTree` holds that state for you, with actions such as `expandAll` and
 * `moveInto`.
 *
 * Clicking a row (or Enter / Space) toggles its selection. The chevron and the arrow keys expand
 * and collapse; without selection, clicking a row expands it too.
 *
 * With `drag-and-drop`, each row gets a drag handle: drag it with a pointer, or focus it and press
 * Space or Enter to move the node with the arrow keys. The tree emits `move` with where the node
 * goes; `useTree`'s `applyMove` applies it. Offer `getTreeStepMove` actions ("Move up", "Indent")
 * in a row menu as well, for people who can't drag.
 *
 * @example
 * ```vue
 * <GsTree
 *   v-model="selected"
 *   v-model:expanded="expanded"
 *   :items="nodes"
 *   selection-cascade
 *   aria-label="Files"
 * >
 *   <template #default="{ node }">
 *     <GsTreeItemPrefixIcon><FolderIcon /></GsTreeItemPrefixIcon>
 *     <GsTreeItemLabel>{{ node.label }}</GsTreeItemLabel>
 *     <GsTreeItemDescription>{{ node.values?.size }}</GsTreeItemDescription>
 *   </template>
 * </GsTree>
 * ```
 */
import { DragDropProvider, DragOverlay } from '@dnd-kit/vue'
import { TreeRoot } from 'reka-ui'
import { computed, ref, shallowReactive, type FunctionalComponent } from 'vue'
import { provideTreeContext } from './context'
import GsTreeItemLabel from './GsTreeItemLabel.vue'
import GsTreeRow from './GsTreeRow.vue'
import {
  GsTreeStaticContent,
  indexStaticTreeItems,
  provideStaticTreeItems,
  toTreeNodes,
  type StaticTreeEntry,
} from './static-tree'
import styles from './styles.module.css'
import {
  getTreeDisabledKeys,
  getTreeFlaggedKeys,
  getTreeIndeterminateKeys,
  getTreeLayout,
  getTreeViewableKeys,
  toggleTreeSelection,
  toggleTreeVisibility,
} from './tree-data'
import type {
  GsTreeItemSlotProps,
  GsTreeKey,
  GsTreeMove,
  GsTreeNode,
  GsTreeProps,
  GsTreeStateFlag,
} from './types'
import { useTreeDrag } from './use-tree-drag'

// With drag-and-drop the root is a fragment (the tree and dnd-kit's drag overlay), so attributes
// are bound to the tree element explicitly.
defineOptions({ inheritAttrs: false })

const {
  items,
  variant = 'cozy',
  showRuleLines = true,
  showVisibility = false,
  selectionMode = 'multiple',
  selectionCascade = false,
  disabledKeys = [],
  disabled = false,
  dragAndDrop = false,
} = defineProps<GsTreeProps<T>>()

const emit = defineEmits<{
  /**
   * A drag (`drag-and-drop`) ended somewhere new. Receives the move to apply to `items`, for
   * example with `useTree`'s `applyMove`.
   */
  move: [move: GsTreeMove]
}>()

/**
 * Selected keys. In `single` mode the array holds at most one key. Without a binding, starts from
 * the nodes flagged `selected`.
 */
const selectedModel = defineModel<GsTreeKey[]>()
/** Expanded keys. Without a binding, starts from the nodes flagged `expanded`. */
const expandedModel = defineModel<GsTreeKey[]>('expanded')
/**
 * Keys whose own visibility flag is on (with `show-visibility`). Without a binding, starts from
 * the nodes flagged `visible`.
 */
const visibleModel = defineModel<GsTreeKey[]>('visible')

defineSlots<{
  /**
   * With `items`: the content of one row, with the row state. Defaults to `GsTreeItemLabel` with
   * the node's `label`. Without `items`: the tree's nested `GsTreeItem`s.
   */
  default?: (props: GsTreeItemSlotProps<T>) => unknown
}>()

// Markup: GsTreeItems register here (see static-tree.ts), and become the tree's data.
const isStatic = computed(() => items === undefined)
const staticItems = shallowReactive<StaticTreeEntry[]>([])
provideStaticTreeItems(staticItems)
const staticIndex = computed(() => indexStaticTreeItems(staticItems))
const nodes = computed(() => items ?? toTreeNodes<T>(staticItems))

const cascade = computed(() => selectionCascade && selectionMode === 'multiple')
const disabledSet = computed(() => getTreeDisabledKeys(nodes.value, disabledKeys))

/** An unbound model starts from the node flags, read once (markup has none). */
function initialKeys(flag: GsTreeStateFlag): GsTreeKey[] {
  const keys = items ? getTreeFlaggedKeys(items, flag) : []
  if (flag !== 'selected') return keys
  if (selectionMode === 'none') return []
  return selectionMode === 'single' ? keys.slice(0, 1) : keys
}
function withInitial(model: typeof selectedModel, flag: GsTreeStateFlag) {
  const initial = initialKeys(flag)
  return computed<GsTreeKey[]>({
    get: () => model.value ?? initial,
    set: (keys) => (model.value = keys),
  })
}
const selected = withInitial(selectedModel, 'selected')
const expanded = withInitial(expandedModel, 'expanded')
const visible = withInitial(visibleModel, 'visible')

const visibleSet = computed(() => new Set(visible.value))
const viewableSet = computed(() => getTreeViewableKeys(nodes.value, visible.value))
const indeterminateSet = computed(() =>
  cascade.value
    ? getTreeIndeterminateKeys(nodes.value, selected.value, disabledSet.value)
    : new Set<GsTreeKey>(),
)

// Reka UI only reads keys from its model (through `getKey`), so key stubs are enough and keep its
// deep model watcher off the node subtrees.
const rekaSelection = computed(() =>
  selectionMode === 'multiple'
    ? selected.value.map((key) => ({ key }))
    : selected.value[0] === undefined
      ? undefined
      : { key: selected.value[0] },
)

const getKey = (node: { key: GsTreeKey }) => node.key
const getChildren = (node: GsTreeNode<T>) => (node.children?.length ? node.children : undefined)

const dnd = useTreeDrag({
  nodes: () => nodes.value,
  expanded: () => expanded.value,
  variant: () => variant,
  move: (move) => emit('move', move),
})

/** Stands in for dnd-kit's `DragDropProvider` without drag-and-drop: renders its slot as is. */
const Passthrough: FunctionalComponent = (_, { slots }) => slots.default?.()

provideTreeContext({
  variant: computed(() => variant),
  showRuleLines: computed(() => showRuleLines),
  showVisibility: computed(() => showVisibility),
  selectionMode: computed(() => selectionMode),
  layout: computed(() => getTreeLayout(nodes.value)),
  isDisabled: (key) => disabled || disabledSet.value.has(key),
  isVisible: (key) => !showVisibility || visibleSet.value.has(key),
  isViewable: (key) => !showVisibility || viewableSet.value.has(key),
  isIndeterminate: (key) => indeterminateSet.value.has(key),
  select: (key) => {
    selected.value = toggleTreeSelection(nodes.value, selected.value, key, {
      mode: selectionMode,
      cascade: cascade.value,
      disabledKeys: disabledSet.value,
    })
  },
  toggleVisibility: (key) => {
    visible.value = toggleTreeVisibility(visible.value, key)
  },
  tabStopKey: ref<GsTreeKey>(),
  dragAndDrop: computed(() => dragAndDrop),
  drop: dnd.drop,
  registerRow: dnd.registerRow,
})
</script>

<template>
  <component
    :is="dragAndDrop ? DragDropProvider : Passthrough"
    v-bind="dragAndDrop ? dnd.provider : {}"
  >
    <TreeRoot
      v-slot="{ flattenItems }"
      v-model:expanded="expanded"
      v-bind="$attrs"
      :items="nodes"
      :get-key="getKey"
      :get-children="getChildren"
      :model-value="rekaSelection"
      :multiple="selectionMode === 'multiple'"
      :disabled="disabled"
      :class="['group/tree', styles.tree]"
      @keydown.capture="dnd.onKeydownCapture"
    >
      <GsTreeRow v-for="item in flattenItems" :key="item._id" :item="item">
        <template #default="row">
          <GsTreeStaticContent v-if="isStatic" :entry="staticIndex.get(row.node.key)" :row="row" />
          <slot v-else v-bind="row">
            <GsTreeItemLabel>{{ row.node.label }}</GsTreeItemLabel>
          </slot>
        </template>
      </GsTreeRow>
      <!-- Markup: the GsTreeItems register their nodes here and render nothing visible. The slot
           gets no row props in this mode; its type describes the `items` mode. -->
      <li v-if="isStatic" hidden><slot v-bind="{} as GsTreeItemSlotProps<T>" /></li>
    </TreeRoot>
    <!-- Follows the pointer while a row is dragged. Empty, and unstyled, the rest of the time. -->
    <DragOverlay v-if="dragAndDrop" :drop-animation="null" aria-hidden="true">
      <template #default="{ source }">
        <div :class="[styles.overlay, styles[variant]]">{{ dnd.label(String(source.id)) }}</div>
      </template>
    </DragOverlay>
  </component>
</template>
