import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ChevronDownIcon, PlaceholderIcon, PlusIcon } from '@wingbrace/glideslope-icons'
import { ref } from 'vue'
import GsIcon from '../../icon/GsIcon.vue'
import GsMenu from '../../menu/GsMenu.vue'
import GsMenuItem from '../../menu/GsMenuItem.vue'
import GsMenuItemDescription from '../../menu/GsMenuItemDescription.vue'
import GsMenuItemLabel from '../../menu/GsMenuItemLabel.vue'
import GsMenuRadioGroup from '../../menu/GsMenuRadioGroup.vue'
import GsMenuRadioItem from '../../menu/GsMenuRadioItem.vue'
import GsMenuSection from '../../menu/GsMenuSection.vue'
import GsMenuSeparator from '../../menu/GsMenuSeparator.vue'
import GsMenuSubmenu from '../../menu/GsMenuSubmenu.vue'
import type { GsMenuVariant } from '../../menu/types'
import GsTooltip from '../../tooltip/GsTooltip.vue'
import GsButton from '../GsButton.vue'
import type { GsButtonColor, GsButtonSize, GsButtonVariant } from '../types'

type StoryArgs = {
  buttonVariant: GsButtonVariant
  buttonColor: GsButtonColor
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
  GsMenuRadioGroup,
  GsMenuRadioItem,
  GsMenuSection,
  GsMenuSeparator,
  GsMenuSubmenu,
  GsTooltip,
  ChevronDownIcon,
  PlaceholderIcon,
  PlusIcon,
}

/** The chevron turns over while the menu is open. */
const chevron = `<GsIcon class="transition-transform" :class="{ 'rotate-180': open }"><ChevronDownIcon /></GsIcon>`

const meta = {
  title: 'Components/Button/Composition/Menu Button',
  tags: ['!autodocs'],
  args: {
    buttonVariant: 'filled',
    buttonColor: 'mono-muted',
    buttonSize: 'medium',
    menuVariant: 'cozy',
    disabled: false,
  },
  argTypes: {
    buttonVariant: {
      control: 'select',
      options: ['filled', 'flat', 'icon', 'outline'],
    },
    buttonColor: {
      control: 'select',
      options: ['mono-muted', 'mono-bold', 'accent', 'serious', 'critical'],
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

export const Default: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, open: ref(false) }),
    template: `
      <GsMenu v-model:open="open" :variant="args.menuVariant">
        <template #trigger>
          <GsButton
            :variant="args.buttonVariant"
            :color="args.buttonColor"
            :size="args.buttonSize"
            :disabled="args.disabled"
            :aria-label="args.buttonVariant === 'icon' ? 'Menu' : undefined"
          >
            <template v-if="args.buttonVariant !== 'icon'">Menu</template>
            ${chevron}
          </GsButton>
        </template>
        <GsMenuItem label="Option 1" />
        <GsMenuItem label="Option 2" />
        <GsMenuItem label="Option 3" />
      </GsMenu>`,
  }),
}

export const WithIcon: Story = {
  render: () => ({
    components,
    setup: () => ({ open: ref(false) }),
    template: `
      <GsMenu v-model:open="open">
        <template #trigger>
          <GsButton variant="filled" color="accent">
            <GsIcon><PlusIcon /></GsIcon>
            Create New
            ${chevron}
          </GsButton>
        </template>
        <GsMenuItem label="New File"><GsIcon><PlaceholderIcon /></GsIcon></GsMenuItem>
        <GsMenuItem label="New Folder"><GsIcon><PlaceholderIcon /></GsIcon></GsMenuItem>
        <GsMenuItem label="New Project"><GsIcon><PlaceholderIcon /></GsIcon></GsMenuItem>
      </GsMenu>`,
  }),
}

export const IconOnly: Story = {
  render: () => ({
    components,
    setup: () => ({ open: ref(false) }),
    template: `
      <GsMenu v-model:open="open">
        <template #trigger>
          <GsButton variant="icon" aria-label="More options">
            <GsIcon><PlaceholderIcon /></GsIcon>
            ${chevron}
          </GsButton>
        </template>
        <GsMenuItem label="Edit" />
        <GsMenuItem label="Duplicate" />
        <GsMenuSeparator />
        <GsMenuItem label="Delete" color="critical" />
      </GsMenu>`,
  }),
}

export const WithSections: Story = {
  render: () => ({
    components,
    setup: () => ({ open: ref(false) }),
    template: `
      <GsMenu v-model:open="open">
        <template #trigger>
          <GsButton>
            File
            ${chevron}
          </GsButton>
        </template>
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
      </GsMenu>`,
  }),
}

export const WithSubmenus: Story = {
  render: () => ({
    components,
    setup: () => ({ open: ref(false) }),
    template: `
      <GsMenu v-model:open="open">
        <template #trigger>
          <GsButton>
            Export
            ${chevron}
          </GsButton>
        </template>
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
      </GsMenu>`,
  }),
}

export const WithSelection: Story = {
  render: () => ({
    components,
    setup: () => ({ open: ref(false), selected: ref('medium') }),
    template: `
      <div class="flex flex-col gap-m">
        <GsMenu v-model:open="open">
          <template #trigger>
            <GsButton>
              Font Size
              ${chevron}
            </GsButton>
          </template>
          <GsMenuRadioGroup v-model="selected">
            <GsMenuRadioItem value="small" label="Small" />
            <GsMenuRadioItem value="medium" label="Medium" />
            <GsMenuRadioItem value="large" label="Large" />
            <GsMenuRadioItem value="extra-large" label="Extra Large" />
          </GsMenuRadioGroup>
        </GsMenu>
        <div class="fg-primary-bold text-body-m">
          Selected:
          <code class="rounded-small bg-surface-raised p-xs">{{ selected || 'none' }}</code>
        </div>
      </div>`,
  }),
}

/**
 * A `GsMenu` can be a `GsTooltip`'s trigger: both attach to the same button. The tooltip is
 * disabled while the menu is open.
 */
export const WithTooltip: Story = {
  render: () => ({
    components,
    setup: () => ({ open: ref(false) }),
    template: `
      <GsTooltip :disabled="open">
        <template #trigger>
          <GsMenu v-model:open="open">
            <template #trigger>
              <GsButton variant="icon" aria-label="More options">
                <GsIcon><PlaceholderIcon /></GsIcon>
                ${chevron}
              </GsButton>
            </template>
            <GsMenuItem label="Edit" />
            <GsMenuItem label="Duplicate" />
            <GsMenuSeparator />
            <GsMenuItem label="Delete" color="critical" />
          </GsMenu>
        </template>
        More options
      </GsTooltip>`,
  }),
}
