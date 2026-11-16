import type { Meta, StoryObj } from '@storybook/vue3-vite'
import {
  CenterOnIcon,
  CollapseAllIcon,
  ExpandAllIcon,
  KebabIcon,
  LockFillIcon,
  PlaceholderIcon,
  WarningIcon,
} from '@wingbrace/glideslope-icons'
import { ref, type ConcreteComponent } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsMenu from '../menu/GsMenu.vue'
import GsMenuItem from '../menu/GsMenuItem.vue'
import GsTree from './GsTree.vue'
import GsTreeItem from './GsTreeItem.vue'
import GsTreeItemActions from './GsTreeItemActions.vue'
import GsTreeItemDescription from './GsTreeItemDescription.vue'
import GsTreeItemLabel from './GsTreeItemLabel.vue'
import GsTreeItemPrefixIcon from './GsTreeItemPrefixIcon.vue'
import { getTreeFlaggedKeys, getTreeKeys, getTreeParentKeys } from './tree-data'
import type { GsTreeKey, GsTreeMoveDirection, GsTreeNode } from './types'
import { useTree } from './use-tree'

/**
 * This type is for customizing and using application-specific values.
 * These values are available in the row slot as `node.values`.
 */
interface ItemValues {
  description?: string
  hasWarning?: boolean
}

/**
 * GsTreeNode holds the properties that are intrinsic to the tree itself. Values are the things
 * that we are using in tree items. The `expanded`, `selected` and `visible` flags set the initial
 * state; after that it lives in key arrays bound with `v-model`.
 */
const items: GsTreeNode<ItemValues>[] = [
  { key: 'european-birds', label: 'European Birds' },
  {
    key: 'north-american-birds',
    label: 'North American Birds',
    expanded: true,
    visible: true,
    children: [
      {
        key: 'blue-jay',
        label: 'Blue jay',
        visible: true,
        values: { description: 'cyanocitta cristata', hasWarning: true },
      },
      {
        key: 'gray-catbird',
        label: 'Gray catbird',
        visible: true,
        values: { description: 'dumetella carolinensis' },
      },
      {
        key: 'coopers-hawk',
        label: "Cooper's Hawk",
        disabled: true,
        visible: false,
        values: { description: 'Astur cooperii' },
      },
      {
        key: 'black-capped-chickadee',
        label: 'Black-capped chickadee',
        disabled: false,
        visible: false,
        values: { description: 'Poecile atricapillus' },
        children: [
          {
            key: 'northern-cardinal',
            label: 'Northern Cardinal',
            values: { description: 'Cardinalis cardinalis', hasWarning: true },
          },
        ],
      },
    ],
  },
  {
    key: 'african-birds',
    label: 'African Birds',
    children: [{ key: 'lilac-breasted-roller', label: 'Lilac-breasted roller' }],
  },
]

const components = {
  GsTree,
  GsTreeItem,
  GsTreeItemPrefixIcon,
  GsTreeItemLabel,
  GsTreeItemDescription,
  GsTreeItemActions,
  GsButton,
  GsIcon,
  PlaceholderIcon,
  LockFillIcon,
  WarningIcon,
  CenterOnIcon,
  ExpandAllIcon,
  CollapseAllIcon,
}

/** Row content: the counterpart of the Design Toolkit stories' `Node` component. */
const node = `
  <template #default="{ node, disabled, viewable, visible }">
    <GsTreeItemPrefixIcon><PlaceholderIcon /></GsTreeItemPrefixIcon>
    <GsTreeItemLabel>{{ node.label }}</GsTreeItemLabel>
    <GsTreeItemDescription v-if="node.values?.description">
      {{ node.values.description }}
    </GsTreeItemDescription>
    <GsTreeItemActions>
      <GsIcon v-if="disabled" class="aspect-square rounded-full p-xs"><LockFillIcon /></GsIcon>
      <GsIcon v-if="node.values?.hasWarning" class="fg-serious-bold"><WarningIcon /></GsIcon>
      <GsButton variant="icon" :aria-label="\`Center on \${node.label}\`" :disabled="!(viewable && visible)">
        <GsIcon><CenterOnIcon /></GsIcon>
      </GsButton>
    </GsTreeItemActions>
  </template>`

const selectionButtons = `
  <GsButton size="small" variant="flat" @click="selectAll">Select All</GsButton>
  <GsButton size="small" variant="flat" @click="unselectAll">Unselect All</GsButton>`

const expansionButtons = `
  <GsButton size="small" variant="icon" aria-label="Expand all" @click="expandAll">
    <GsIcon><ExpandAllIcon /></GsIcon>
  </GsButton>
  <GsButton size="small" variant="icon" aria-label="Collapse all" @click="collapseAll">
    <GsIcon><CollapseAllIcon /></GsIcon>
  </GsButton>`

const meta = {
  title: 'Components/Tree',
  // Storybook's `component` type can't hold a generic component (vue-tsc types it as a generic
  // function), so it gets a plain component type. Args are still typed from GsTree below.
  component: GsTree as unknown as Omit<ConcreteComponent, 'props'>,
  args: {
    items,
    variant: 'cozy',
    showRuleLines: true,
    selectionMode: 'multiple',
    showVisibility: true,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['cozy', 'compact', 'crammed'],
    },
    selectionMode: {
      control: 'select',
      options: ['none', 'multiple', 'single'],
    },
  },
  parameters: {
    controls: {
      include: ['showRuleLines', 'showVisibility', 'variant', 'selectionMode'],
    },
    docs: {
      subtitle:
        'Tree component that provides users with a way to navigate nested hierarchical information, with support for keyboard navigation and selection.',
    },
  },
} satisfies Meta<typeof GsTree>

export default meta
type Story = StoryObj<typeof meta>

/**
 * This story is using the optional useTree composable, a convenience helper that holds the tree's
 * state. Its `applyMove` applies the moves the tree emits with `drag-and-drop`: drag a row by its
 * handle, or focus the handle and press Space.
 */
export const DragAndDrop: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, ...useTree({ items }) }),
    template: `
      <div>
        <div class="flex items-center gap-m">${selectionButtons}${expansionButtons}</div>
        <GsTree
          v-bind="args"
          v-model="selected"
          v-model:expanded="expanded"
          v-model:visible="visible"
          :items="nodes"
          drag-and-drop
          class="w-[500px]"
          aria-label="Drag and Drop example"
          @move="applyMove"
        >${node}</GsTree>
      </div>`,
  }),
}

/**
 * A Stateless tree uses data from a remote source to drive tree display and operations. The
 * pure helpers from `tree-data` (`getTreeKeys`, `getTreeParentKeys`, …) provide basic tree data
 * operations.
 */
export const Stateless: Story = {
  render: (args) => ({
    components,
    setup: () => {
      /**
       * IMPORTANT: This ref is just a cheap way to represent a database in Storybook, NOT
       * component state. In your application, this would be your remote persistence database or
       * localStorage, i.e. using fetch or a store.
       *
       * Critically, it is the fetched data from the server that is driving the Tree, not
       * component state.
       */
      const db = ref({
        expanded: getTreeFlaggedKeys(items, 'expanded'),
        selected: getTreeFlaggedKeys(items, 'selected'),
        visible: getTreeFlaggedKeys(items, 'visible'),
      })

      const handleSelection = (keys: GsTreeKey[]) => (db.value.selected = keys)
      const handleExpansion = (keys: GsTreeKey[]) => (db.value.expanded = keys)
      const handleVisibility = (keys: GsTreeKey[]) => (db.value.visible = keys)
      const expandAll = () => (db.value.expanded = getTreeParentKeys(items))
      const collapseAll = () => (db.value.expanded = [])
      const selectAll = () => (db.value.selected = getTreeKeys(items, (node) => !node.disabled))
      const unselectAll = () => (db.value.selected = [])

      return {
        args,
        db,
        handleSelection,
        handleExpansion,
        handleVisibility,
        expandAll,
        collapseAll,
        selectAll,
        unselectAll,
      }
    },
    template: `
      <div>
        <div class="flex items-center gap-m">${selectionButtons}${expansionButtons}</div>
        <GsTree
          v-bind="args"
          :model-value="db.selected"
          :expanded="db.expanded"
          :visible="db.visible"
          class="w-[500px]"
          aria-label="Stateless Example"
          @update:model-value="handleSelection"
          @update:expanded="handleExpansion"
          @update:visible="handleVisibility"
        >${node}</GsTree>
      </div>`,
  }),
}

/**
 * Static collections can use the tree directly, for simple use cases. Leave out `items` and write
 * nested `GsTreeItem`s; plain refs bound with `v-model`, `v-model:expanded` and `v-model:visible`
 * hold the state, and rows show each item's `label`.
 */
export const StaticCollection: Story = {
  args: { items: undefined },
  render: (args) => ({
    components,
    setup: () => ({
      args,
      expanded: ref<GsTreeKey[]>(['fruit']),
      selected: ref<GsTreeKey[]>([]),
      visibility: ref<GsTreeKey[]>(['fruit', 'apples', 'red']),
    }),
    template: `
      <GsTree
        v-bind="args"
        v-model="selected"
        v-model:expanded="expanded"
        v-model:visible="visibility"
        class="w-[500px]"
        aria-label="Basic Static Example"
      >
        <GsTreeItem value="fruit" label="Fruit">
          <GsTreeItem value="apples" label="Apples">
            <GsTreeItem value="green" label="Green Apple" />
            <GsTreeItem value="red" label="Red Apple" />
            <GsTreeItem value="yellow" label="Yellow Apple" />
          </GsTreeItem>
        </GsTreeItem>
        <GsTreeItem value="vegetables" label="Vegetables">
          <GsTreeItem value="carrot" label="Carrot" />
          <GsTreeItem value="kale" label="Kale" />
        </GsTreeItem>
      </GsTree>`,
  }),
}

const fileSystemData: GsTreeNode<ItemValues>[] = [
  {
    key: 'documents',
    label: 'Documents',
    expanded: true,
    children: [
      {
        key: 'work',
        label: 'Work',
        expanded: true,
        children: [
          { key: 'report.pdf', label: 'Report.pdf', values: { description: '2.4 MB' } },
          {
            key: 'presentation.pptx',
            label: 'Presentation.pptx',
            values: { description: '5.1 MB' },
          },
        ],
      },
      {
        key: 'personal',
        label: 'Personal',
        expanded: true,
        children: [
          { key: 'vacation.jpg', label: 'Vacation.jpg', values: { description: '1.8 MB' } },
          { key: 'notes.txt', label: 'Notes.txt', values: { description: '12 KB' } },
        ],
      },
    ],
  },
  {
    key: 'downloads',
    label: 'Downloads',
    expanded: true,
    children: [{ key: 'installer.dmg', label: 'Installer.dmg', values: { description: '145 MB' } }],
  },
]

/**
 * Basic cascade selection - selecting a parent automatically selects all descendants.
 * Try clicking the "Documents" folder checkbox to select all files within it.
 */
export const CascadeBasic: Story = {
  render: (args) => ({
    components,
    setup: () => ({
      args,
      ...useTree({ items: fileSystemData, selectionCascade: true }),
    }),
    template: `
      <div class="flex flex-col gap-m">
        <div class="flex items-center gap-m">${selectionButtons}</div>
        <div class="rounded-medium bg-surface-raised p-m">
          <GsTree
            v-bind="args"
            v-model="selected"
            v-model:expanded="expanded"
            v-model:visible="visible"
            :items="nodes"
            selection-cascade
            class="w-[500px]"
            aria-label="Cascade Selection Example"
          >${node}</GsTree>
        </div>
      </div>`,
  }),
}

/**
 * Cascade selection with drag-and-drop enabled.
 * Test how cascade state updates when moving selected items between parents.
 *
 * Try this:
 * 1. Select "Documents" (all children become selected)
 * 2. Drag "Report.pdf" to "Downloads"
 * 3. Notice how "Documents" becomes indeterminate (some children moved away)
 * 4. Notice how "Downloads" becomes indeterminate (gained a selected child)
 */
export const CascadeWithDragAndDrop: Story = {
  render: (args) => ({
    components,
    setup: () => ({
      args,
      ...useTree({ items: fileSystemData, selectionCascade: true }),
    }),
    template: `
      <div class="flex flex-col gap-m">
        <div class="flex items-center gap-m">${selectionButtons}${expansionButtons}</div>
        <div class="rounded-medium bg-surface-raised p-m">
          <GsTree
            v-bind="args"
            v-model="selected"
            v-model:expanded="expanded"
            v-model:visible="visible"
            :items="nodes"
            selection-cascade
            drag-and-drop
            class="w-[500px]"
            aria-label="Cascade with Drag and Drop"
            @move="applyMove"
          >${node}</GsTree>
        </div>
      </div>`,
  }),
}

/**
 * Glideslope extra: `v-model:visible` holds the keys whose eye toggle is on. Nodes that are hidden,
 * or sit under a hidden node, are muted; children keep their flags, so revealing a parent restores
 * them. `useTree`'s `revealAll` and `hideAll` set every flag at once.
 */
export const Visibility: Story = {
  args: { selectionMode: 'none' },
  render: (args) => ({
    components,
    setup: () => ({
      args,
      ...useTree({
        items,
        expanded: ['north-american-birds', 'black-capped-chickadee'],
        visible: ['north-american-birds', 'blue-jay', 'gray-catbird', 'northern-cardinal'],
      }),
    }),
    template: `
      <div class="flex w-[500px] flex-col gap-m">
        <div class="flex items-center gap-m">
          <GsButton size="small" variant="flat" @click="revealAll">Show All</GsButton>
          <GsButton size="small" variant="flat" @click="hideAll">Hide All</GsButton>
        </div>
        <GsTree
          v-bind="args"
          v-model:expanded="expanded"
          v-model:visible="visible"
          :items="nodes"
          aria-label="Map layers"
        >${node}</GsTree>
        <span class="fg-primary-muted text-body-s">visible: {{ visible }}</span>
      </div>`,
  }),
}

const moveSteps: { direction: GsTreeMoveDirection; label: string }[] = [
  { direction: 'up', label: 'Move up' },
  { direction: 'down', label: 'Move down' },
  { direction: 'indent', label: 'Indent' },
  { direction: 'outdent', label: 'Outdent' },
]

/**
 * Glideslope extra: `useTree`'s `moveStep` moves a node one step without dragging, here from a row
 * menu: the single-pointer alternative to dragging. `canMoveStep` disables the steps a node can't
 * take.
 */
export const MoveWithoutDragging: Story = {
  args: { showVisibility: false },
  render: (args) => ({
    components: { ...components, GsMenu, GsMenuItem, KebabIcon },
    setup: () => ({ args, moveSteps, ...useTree({ items: fileSystemData }) }),
    template: `
      <GsTree
        v-bind="args"
        v-model="selected"
        v-model:expanded="expanded"
        :items="nodes"
        drag-and-drop
        class="w-[500px]"
        aria-label="Files"
        @move="applyMove"
      >
        <template #default="{ node }">
          <GsTreeItemPrefixIcon><PlaceholderIcon /></GsTreeItemPrefixIcon>
          <GsTreeItemLabel>{{ node.label }}</GsTreeItemLabel>
          <GsTreeItemDescription v-if="node.values?.description">
            {{ node.values.description }}
          </GsTreeItemDescription>
          <GsTreeItemActions>
            <GsMenu @action="(direction) => moveStep(node.key, direction)">
              <template #trigger>
                <GsButton variant="icon" :aria-label="\`Move \${node.label}\`">
                  <GsIcon><KebabIcon /></GsIcon>
                </GsButton>
              </template>
              <GsMenuItem
                v-for="step in moveSteps"
                :key="step.direction"
                :value="step.direction"
                :label="step.label"
                :disabled="!canMoveStep(node.key, step.direction)"
              />
            </GsMenu>
          </GsTreeItemActions>
        </template>
      </GsTree>`,
  }),
}
