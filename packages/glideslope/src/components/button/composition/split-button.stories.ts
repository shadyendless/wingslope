import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ChevronDownIcon, PlaceholderIcon } from '@wingbrace/glideslope-icons'
import { ref } from 'vue'
import GsIcon from '../../icon/GsIcon.vue'
import GsMenu from '../../menu/GsMenu.vue'
import GsMenuItem from '../../menu/GsMenuItem.vue'
import GsMenuItemDescription from '../../menu/GsMenuItemDescription.vue'
import GsMenuItemLabel from '../../menu/GsMenuItemLabel.vue'
import GsMenuSection from '../../menu/GsMenuSection.vue'
import GsMenuSeparator from '../../menu/GsMenuSeparator.vue'
import GsMenuSubmenu from '../../menu/GsMenuSubmenu.vue'
import type { GsMenuVariant } from '../../menu/types'
import GsTooltip from '../../tooltip/GsTooltip.vue'
import GsButton from '../GsButton.vue'
import type { GsButtonSize } from '../types'

type StoryArgs = {
  buttonColor: 'mono-muted' | 'mono-bold' | 'accent'
  buttonSize: GsButtonSize
  menuVariant: GsMenuVariant
  disabled: boolean
}

const components = {
  GsButton,
  GsIcon,
  GsMenu,
  GsMenuItem,
  GsMenuItemDescription,
  GsMenuItemLabel,
  GsMenuSection,
  GsMenuSeparator,
  GsMenuSubmenu,
  GsTooltip,
  ChevronDownIcon,
  PlaceholderIcon,
}

/** The action half of the split button. */
const actionButton = `
  <GsButton
    variant="icon"
    :size="args.buttonSize"
    :color="args.buttonColor"
    :disabled="args.disabled"
    class="rounded-r-none"
    aria-label="Tool"
  >
    <GsIcon><PlaceholderIcon /></GsIcon>
  </GsButton>`

/** The menu half of the split button. Its chevron turns over while the menu is open. */
const menuButton = `
  <GsButton
    variant="icon"
    :color="args.buttonColor"
    class="w-m min-w-m rounded-l-none p-0"
    :disabled="args.disabled"
    :size="args.buttonSize"
    aria-label="Tool options"
  >
    <GsIcon class="flex h-full w-m transition-transform" :class="{ 'rotate-180': open }">
      <ChevronDownIcon />
    </GsIcon>
  </GsButton>`

const meta = {
  title: 'Components/Button/Composition/Split Button',
  tags: ['!autodocs'],
  args: {
    buttonColor: 'mono-muted',
    buttonSize: 'medium',
    menuVariant: 'compact',
  },
  argTypes: {
    buttonColor: {
      control: 'select',
      options: ['mono-muted', 'mono-bold', 'accent'],
    },
    buttonSize: {
      control: 'select',
      options: ['large', 'medium', 'small', 'xsmall'],
    },
    menuVariant: {
      control: 'select',
      options: ['compact', 'cozy'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<StoryArgs>

/** The menu half has a tooltip: a `GsMenu` can be a `GsTooltip`'s trigger. */
export const Default: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, open: ref(false) }),
    template: `
      <div class="flex flex-row">
        ${actionButton}
        <GsTooltip :disabled="open">
          <template #trigger>
            <GsMenu v-model:open="open" :variant="args.menuVariant">
              <template #trigger>${menuButton}</template>
              <GsMenuItem label="Option 1" />
              <GsMenuItem label="Option 2" />
              <GsMenuItem label="Option 3" />
            </GsMenu>
          </template>
          Tool label
        </GsTooltip>
      </div>`,
  }),
}

export const WithIcon: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, open: ref(false) }),
    template: `
      <div class="flex flex-row">
        ${actionButton}
        <GsMenu v-model:open="open">
          <template #trigger>${menuButton}</template>
          <GsMenuItem label="New File"><GsIcon><PlaceholderIcon /></GsIcon></GsMenuItem>
          <GsMenuItem label="New Folder"><GsIcon><PlaceholderIcon /></GsIcon></GsMenuItem>
          <GsMenuItem label="New Project"><GsIcon><PlaceholderIcon /></GsIcon></GsMenuItem>
        </GsMenu>
      </div>`,
  }),
}

export const WithSections: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, open: ref(false) }),
    template: `
      <div class="flex flex-row">
        ${actionButton}
        <GsMenu v-model:open="open">
          <template #trigger>${menuButton}</template>
          <GsMenuSection title="Create">
            <GsMenuItem label="New File"><GsIcon><PlaceholderIcon /></GsIcon></GsMenuItem>
            <GsMenuItem label="New Folder"><GsIcon><PlaceholderIcon /></GsIcon></GsMenuItem>
          </GsMenuSection>
          <GsMenuSeparator />
          <GsMenuSection title="Actions">
            <GsMenuItem label="Save"><GsIcon><PlaceholderIcon /></GsIcon></GsMenuItem>
            <GsMenuItem label="Export"><GsIcon><PlaceholderIcon /></GsIcon></GsMenuItem>
          </GsMenuSection>
          <GsMenuSeparator />
          <GsMenuItem label="Settings"><GsIcon><PlaceholderIcon /></GsIcon></GsMenuItem>
        </GsMenu>
      </div>`,
  }),
}

export const WithSubmenus: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, open: ref(false) }),
    template: `
      <div class="flex flex-row">
        ${actionButton}
        <GsMenu v-model:open="open">
          <template #trigger>${menuButton}</template>
          <GsMenuItem label="Quick Export" />
          <GsMenuSeparator />
          <GsMenuSubmenu label="Export As...">
            <GsMenuItem text-value="PDF">
              <GsMenuItemLabel>PDF</GsMenuItemLabel>
              <GsMenuItemDescription>Portable Document Format</GsMenuItemDescription>
            </GsMenuItem>
            <GsMenuItem text-value="CSV">
              <GsMenuItemLabel>CSV</GsMenuItemLabel>
              <GsMenuItemDescription>Comma Separated Values</GsMenuItemDescription>
            </GsMenuItem>
            <GsMenuItem text-value="JSON">
              <GsMenuItemLabel>JSON</GsMenuItemLabel>
              <GsMenuItemDescription>JavaScript Object Notation</GsMenuItemDescription>
            </GsMenuItem>
          </GsMenuSubmenu>
        </GsMenu>
      </div>`,
  }),
}
