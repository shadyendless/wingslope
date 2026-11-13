import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { KebabIcon, PlaceholderIcon } from '@wingbrace/glideslope-icons'
import { computed, reactive, ref } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsContextMenu from './GsContextMenu.vue'
import GsMenu from './GsMenu.vue'
import GsMenuCheckboxItem from './GsMenuCheckboxItem.vue'
import GsMenuItem from './GsMenuItem.vue'
import GsMenuItemDescription from './GsMenuItemDescription.vue'
import GsMenuItemLabel from './GsMenuItemLabel.vue'
import GsMenuRadioGroup from './GsMenuRadioGroup.vue'
import GsMenuRadioItem from './GsMenuRadioItem.vue'
import GsMenuSection from './GsMenuSection.vue'
import GsMenuSeparator from './GsMenuSeparator.vue'
import GsMenuSubmenu from './GsMenuSubmenu.vue'
import type { GsMenuItemColor } from './types'

const parts = {
  GsMenu,
  GsContextMenu,
  GsMenuItem,
  GsMenuItemLabel,
  GsMenuItemDescription,
  GsMenuCheckboxItem,
  GsMenuRadioGroup,
  GsMenuRadioItem,
  GsMenuSection,
  GsMenuSeparator,
  GsMenuSubmenu,
  GsButton,
  GsIcon,
  KebabIcon,
  PlaceholderIcon,
}

const meta = {
  title: 'Components/Menu',
  component: GsMenu,
  args: {
    variant: 'cozy',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['cozy', 'compact'],
    },
  },
} satisfies Meta<typeof GsMenu>

export default meta
type Story = StoryObj<typeof meta>

type MenuItemType = {
  id: number
  name: string
  description?: string
  children?: MenuItemType[]
  disabled?: boolean
  hotkey?: string
  color?: GsMenuItemColor
}

const menuItems: MenuItemType[] = [
  {
    id: 1,
    name: 'North American Birds',
    children: [
      { id: 2, name: 'Blue jay', description: 'Cyanocitta cristata', color: 'serious' },
      {
        id: 3,
        name: 'Gray catbird',
        description: 'Dumetella carolinensis',
        disabled: true,
        hotkey: '⌘V',
      },
      {
        id: 4,
        name: 'Black-capped chickadee',
        description: 'Poecile atricapillus',
        color: 'critical',
      },
      { id: 5, name: 'Song sparrow', description: 'Melospiza melodia' },
    ],
  },
  {
    id: 6,
    name: 'African Birds',
    children: [
      { id: 7, name: 'Lilac-breasted roller', description: 'Coracias caudatus' },
      { id: 8, name: 'Hornbill', description: 'Bucerotidae' },
    ],
  },
]

const kebabTrigger = `
  <template #trigger>
    <GsButton variant="icon" aria-label="Menu"><GsIcon><KebabIcon /></GsIcon></GsButton>
  </template>`

/** Checkbox items for the North American birds submenu, bound to `selected`. */
const birdSubmenu = `
  <GsMenuSubmenu label="North American Birds">
    <GsMenuCheckboxItem v-model="selected.blueJay">
      <GsIcon><PlaceholderIcon /></GsIcon>
      <GsMenuItemLabel>Blue Jay</GsMenuItemLabel>
      <GsMenuItemDescription>Cyanocitta cristata</GsMenuItemDescription>
    </GsMenuCheckboxItem>
    <GsMenuCheckboxItem v-model="selected.catbird" disabled>
      <GsIcon><PlaceholderIcon /></GsIcon>
      <GsMenuItemLabel>Gray catbird</GsMenuItemLabel>
      <GsMenuItemDescription>Dumetella carolinensis</GsMenuItemDescription>
    </GsMenuCheckboxItem>
    <GsMenuCheckboxItem v-model="selected.mallard" color="serious" hotkey="⌘V">
      <GsIcon><PlaceholderIcon /></GsIcon>
      <GsMenuItemLabel>Mallard</GsMenuItemLabel>
      <GsMenuItemDescription>Anas platyrhynchos</GsMenuItemDescription>
    </GsMenuCheckboxItem>
    <GsMenuCheckboxItem v-model="selected.swift" color="critical">
      <GsIcon><PlaceholderIcon /></GsIcon>
      <GsMenuItemLabel>Chimney swift</GsMenuItemLabel>
      <GsMenuItemDescription>Chaetura pelagica</GsMenuItemDescription>
    </GsMenuCheckboxItem>
    <GsMenuCheckboxItem v-model="selected.guillemot" hotkey="⌘X">
      <GsIcon><PlaceholderIcon /></GsIcon>
      <GsMenuItemLabel>Brünnich's guillemot</GsMenuItemLabel>
      <GsMenuItemDescription>Dumetella carolinensis</GsMenuItemDescription>
    </GsMenuCheckboxItem>
  </GsMenuSubmenu>`

const selectedBirds = () =>
  reactive({ blueJay: false, catbird: false, mallard: true, swift: true, guillemot: true })

/** The items of the "Additional Notable Species" section. */
const notableSpecies = `
  <GsMenuItem color="serious" hotkey="⌘V">
    <GsIcon><PlaceholderIcon /></GsIcon>
    <GsMenuItemLabel>Mallard</GsMenuItemLabel>
    <GsMenuItemDescription>Anas platyrhynchos</GsMenuItemDescription>
  </GsMenuItem>
  <GsMenuItem color="critical">
    <GsIcon><PlaceholderIcon /></GsIcon>
    <GsMenuItemLabel>Chimney swift</GsMenuItemLabel>
    <GsMenuItemDescription>Chaetura pelagica</GsMenuItemDescription>
  </GsMenuItem>
  <GsMenuItem hotkey="⌘X">
    <GsIcon><PlaceholderIcon /></GsIcon>
    <GsMenuItemLabel>Brünnich's guillemot</GsMenuItemLabel>
    <GsMenuItemDescription>Dumetella carolinensis</GsMenuItemDescription>
  </GsMenuItem>`

const songbirds = `
  <GsMenuItem hotkey="⌘A">
    <GsIcon><PlaceholderIcon /></GsIcon>
    <GsMenuItemLabel>Songbirds</GsMenuItemLabel>
  </GsMenuItem>`

export const Basic: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args, selected: selectedBirds() }),
    template: `
      <GsMenu v-bind="args">
        ${kebabTrigger}
        ${songbirds}
        <GsMenuSeparator />
        ${birdSubmenu}
        <GsMenuSeparator />
        <GsMenuSection title="Additional Notable Species">
          ${notableSpecies}
        </GsMenuSection>
      </GsMenu>`,
  }),
}

export const Dynamic: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args, menuItems }),
    template: `
      <GsMenu v-bind="args">
        ${kebabTrigger}
        <template v-for="item in menuItems" :key="item.id">
          <GsMenuSubmenu
            v-if="item.children"
            :label="item.name"
            :disabled="item.disabled"
            :color="item.color"
          >
            <template #trigger><GsIcon><PlaceholderIcon /></GsIcon></template>
            <GsMenuItem
              v-for="child in item.children"
              :key="child.id"
              :disabled="child.disabled"
              :color="child.color"
              :hotkey="child.hotkey"
            >
              <GsIcon><PlaceholderIcon /></GsIcon>
              <GsMenuItemLabel>{{ child.name }}</GsMenuItemLabel>
              <GsMenuItemDescription v-if="child.description">
                {{ child.description }}
              </GsMenuItemDescription>
            </GsMenuItem>
          </GsMenuSubmenu>
          <GsMenuItem
            v-else
            :disabled="item.disabled"
            :color="item.color"
            :hotkey="item.hotkey"
          >
            <GsIcon><PlaceholderIcon /></GsIcon>
            <GsMenuItemLabel>{{ item.name }}</GsMenuItemLabel>
            <GsMenuItemDescription v-if="item.description">
              {{ item.description }}
            </GsMenuItemDescription>
          </GsMenuItem>
        </template>
      </GsMenu>`,
  }),
}

/**
 * Right-click (or long-press) the area to open a `GsContextMenu` at the pointer. It takes the same
 * items as `GsMenu`. The area is focusable, so the context-menu key and Shift+F10 open it too.
 */
export const ContextMenu: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args, menuItems }),
    template: `
      <GsContextMenu :variant="args.variant">
        <template #trigger>
          <div
            tabindex="0"
            class="m-xl flex h-dvh w-dvh items-center justify-center bg-surface-raised fg-primary-bold"
          >
            right-click for context menu
          </div>
        </template>
        <template v-for="item in menuItems" :key="item.id">
          <GsMenuSubmenu
            v-if="item.children"
            :label="item.name"
            :disabled="item.disabled"
            :color="item.color"
          >
            <GsMenuItem
              v-for="child in item.children"
              :key="child.id"
              :label="child.name"
              :disabled="child.disabled"
              :color="child.color"
              :hotkey="child.hotkey"
            />
          </GsMenuSubmenu>
          <GsMenuItem
            v-else
            :label="item.name"
            :disabled="item.disabled"
            :color="item.color"
            :hotkey="item.hotkey"
          />
        </template>
      </GsContextMenu>`,
  }),
}

/** A section heading with custom content, from `GsMenuSection`'s `#title` slot. */
export const DynamicMenuHeader: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args, selected: selectedBirds() }),
    template: `
      <GsMenu v-bind="args">
        ${kebabTrigger}
        ${songbirds}
        <GsMenuSeparator />
        ${birdSubmenu}
        <GsMenuSeparator />
        <GsMenuSection>
          <template #title>
            <div>
              <div class="text-body-m">Additional Notable Species</div>
              <div class="text-body-xs">These birds sound made up.</div>
            </div>
          </template>
          ${notableSpecies}
        </GsMenuSection>
      </GsMenu>`,
  }),
}

/** Uses `side` and `align` to open the menu above the trigger instead of below. */
export const CustomPlacement: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({
      args,
      placements: [
        { name: 'Top Start', side: 'top', align: 'start' },
        { name: 'Top End', side: 'top', align: 'end' },
        { name: 'Bottom Start', side: 'bottom', align: 'start' },
        { name: 'Bottom End', side: 'bottom', align: 'end' },
      ],
    }),
    template: `
      <div class="flex h-[300px] items-end gap-xl p-xl">
        <GsMenu
          v-for="placement in placements"
          :key="placement.name"
          v-bind="args"
          :side="placement.side"
          :align="placement.align"
        >
          <template #trigger><GsButton>{{ placement.name }}</GsButton></template>
          <GsMenuItem label="Edit" />
          <GsMenuItem label="Copy" />
          <GsMenuItem label="Delete" />
        </GsMenu>
      </div>`,
  }),
}

/**
 * Gives each item a `value` and handles them all with the menu's `@action`. The last chosen value is
 * shown below the menu.
 */
export const WithActionHandler: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args, lastAction: ref<string | number | null>(null) }),
    template: `
      <div class="flex flex-col gap-m">
        <GsMenu v-bind="args" @action="lastAction = $event">
          <template #trigger><GsButton>Actions Menu</GsButton></template>
          <GsMenuItem value="new-file" label="New File" hotkey="⌘N">
            <GsIcon><PlaceholderIcon /></GsIcon>
          </GsMenuItem>
          <GsMenuItem value="open-file" label="Open File" hotkey="⌘O">
            <GsIcon><PlaceholderIcon /></GsIcon>
          </GsMenuItem>
          <GsMenuSeparator />
          <GsMenuItem value="save" label="Save" hotkey="⌘S">
            <GsIcon><PlaceholderIcon /></GsIcon>
          </GsMenuItem>
          <GsMenuItem value="save-as" label="Save As..." hotkey="⇧⌘S">
            <GsIcon><PlaceholderIcon /></GsIcon>
          </GsMenuItem>
          <GsMenuSeparator />
          <GsMenuItem value="delete" label="Delete" hotkey="⌘⌫" color="critical">
            <GsIcon><PlaceholderIcon /></GsIcon>
          </GsMenuItem>
        </GsMenu>
        <div v-if="lastAction" class="text-body-m fg-primary-bold">
          Last action: <code class="rounded-small bg-surface-raised p-xs">{{ lastAction }}</code>
        </div>
      </div>`,
  }),
}

/**
 * Multiple selection with `GsMenuCheckboxItem`s, each bound with `v-model`. `@select.prevent`
 * keeps the menu open while toggling.
 */
export const MultipleSelection: Story = {
  render: () => ({
    components: parts,
    setup: () => {
      const formatting = reactive({
        bold: true,
        italic: false,
        underline: false,
        strikethrough: false,
      })
      const selected = computed(() =>
        Object.entries(formatting)
          .filter(([, on]) => on)
          .map(([key]) => key)
          .join(', '),
      )
      return { formatting, selected }
    },
    template: `
      <div class="flex flex-col gap-m">
        <GsMenu>
          <template #trigger><GsButton>Text Formatting</GsButton></template>
          <GsMenuCheckboxItem v-model="formatting.bold" label="Bold" hotkey="⌘B" @select.prevent />
          <GsMenuCheckboxItem v-model="formatting.italic" label="Italic" hotkey="⌘I" @select.prevent />
          <GsMenuCheckboxItem
            v-model="formatting.underline"
            label="Underline"
            hotkey="⌘U"
            @select.prevent
          />
          <GsMenuCheckboxItem
            v-model="formatting.strikethrough"
            label="Strikethrough"
            hotkey="⇧⌘X"
            @select.prevent
          />
        </GsMenu>
        <div class="text-body-m fg-primary-bold">
          Selected: <code class="rounded-small bg-surface-raised p-xs">{{ selected || 'none' }}</code>
        </div>
      </div>`,
  }),
}

/** Single selection with a `GsMenuRadioGroup` bound with `v-model`. */
export const SingleSelection: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ fontSize: ref('medium') }),
    template: `
      <div class="flex flex-col gap-m">
        <GsMenu>
          <template #trigger><GsButton>Font Size</GsButton></template>
          <GsMenuRadioGroup v-model="fontSize">
            <GsMenuRadioItem value="small" label="Small" />
            <GsMenuRadioItem value="medium" label="Medium" />
            <GsMenuRadioItem value="large" label="Large" />
            <GsMenuRadioItem value="extra-large" label="Extra Large" />
          </GsMenuRadioGroup>
        </GsMenu>
        <div class="text-body-m fg-primary-bold">
          Selected: <code class="rounded-small bg-surface-raised p-xs">{{ fontSize || 'none' }}</code>
        </div>
      </div>`,
  }),
}

/** Disabled menu items. */
export const DisabledItems: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args }),
    template: `
      <GsMenu v-bind="args">
        <template #trigger><GsButton>Menu with Disabled Items</GsButton></template>
        <GsMenuItem label="Available Action" />
        <GsMenuItem disabled>
          <GsMenuItemLabel>Disabled Action</GsMenuItemLabel>
          <GsMenuItemDescription>This action is not available</GsMenuItemDescription>
        </GsMenuItem>
        <GsMenuItem label="Another Available Action" />
        <GsMenuSeparator />
        <GsMenuItem label="Also Disabled" disabled />
        <GsMenuItem label="Delete (Available)" color="critical" />
      </GsMenu>`,
  }),
}

/** All color variants for menu items. */
export const ColorVariants: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args }),
    template: `
      <GsMenu v-bind="args">
        <template #trigger><GsButton>Color Variants</GsButton></template>
        <GsMenuItem color="info">
          <GsIcon><PlaceholderIcon /></GsIcon>
          <GsMenuItemLabel>Info (Default)</GsMenuItemLabel>
          <GsMenuItemDescription>Standard menu item</GsMenuItemDescription>
        </GsMenuItem>
        <GsMenuItem color="serious">
          <GsIcon><PlaceholderIcon /></GsIcon>
          <GsMenuItemLabel>Serious</GsMenuItemLabel>
          <GsMenuItemDescription>Warning or important action</GsMenuItemDescription>
        </GsMenuItem>
        <GsMenuItem color="critical">
          <GsIcon><PlaceholderIcon /></GsIcon>
          <GsMenuItemLabel>Critical</GsMenuItemLabel>
          <GsMenuItemDescription>Destructive or dangerous action</GsMenuItemDescription>
        </GsMenuItem>
      </GsMenu>`,
  }),
}

/** A simple menu without icons or descriptions. */
export const SimpleMenu: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args }),
    template: `
      <GsMenu v-bind="args">
        <template #trigger><GsButton>Simple Menu</GsButton></template>
        <GsMenuItem label="Cut" />
        <GsMenuItem label="Copy" />
        <GsMenuItem label="Paste" />
      </GsMenu>`,
  }),
}

/** Uses `offset` to add spacing between trigger and menu. */
export const WithOffset: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({
      args,
      offsets: [
        { name: 'No Offset', offset: 0 },
        { name: '8px Offset', offset: 8 },
        { name: '16px Offset', offset: 16 },
      ],
    }),
    template: `
      <div class="flex gap-xl">
        <GsMenu
          v-for="item in offsets"
          :key="item.name"
          v-bind="args"
          side="bottom"
          align="center"
          :offset="item.offset"
        >
          <template #trigger><GsButton>{{ item.name }}</GsButton></template>
          <GsMenuItem label="Menu Item 1" />
          <GsMenuItem label="Menu Item 2" />
        </GsMenu>
      </div>`,
  }),
}
