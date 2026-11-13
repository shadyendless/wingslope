import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { DeleteIcon, InformationIcon } from '@wingbrace/glideslope-icons'
import GsButton from '../button/GsButton.vue'
import GsCheckbox from '../checkbox/GsCheckbox.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsPopover from './GsPopover.vue'
import GsPopoverClose from './GsPopoverClose.vue'
import GsPopoverContent from './GsPopoverContent.vue'
import GsPopoverFooter from './GsPopoverFooter.vue'
import GsPopoverTitle from './GsPopoverTitle.vue'

const meta = {
  title: 'Components/Popover',
  component: GsPopover,
  args: {
    side: 'bottom',
  },
  argTypes: {
    side: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
      table: { defaultValue: { summary: 'bottom' } },
    },
  },
} satisfies Meta<typeof GsPopover>

export default meta
type Story = StoryObj<typeof meta>

export const Simple: Story = {
  render: (args) => ({
    components: { GsPopover, GsPopoverTitle, GsPopoverContent, GsButton, GsIcon, InformationIcon },
    setup: () => ({ args }),
    template: `
      <GsPopover v-bind="args">
        <template #trigger>
          <GsButton variant="icon" aria-label="Information">
            <GsIcon><InformationIcon /></GsIcon>
          </GsButton>
        </template>
        <GsPopoverTitle>Popover Title</GsPopoverTitle>
        <GsPopoverContent>Lorum Ipsum text for the dialog shall go here.</GsPopoverContent>
      </GsPopover>`,
  }),
}

export const WithActions: Story = {
  render: (args) => ({
    components: {
      GsPopover,
      GsPopoverTitle,
      GsPopoverContent,
      GsPopoverFooter,
      GsPopoverClose,
      GsButton,
      GsIcon,
      DeleteIcon,
    },
    setup: () => ({ args }),
    template: `
      <GsPopover v-bind="args">
        <template #trigger>
          <GsButton variant="icon" aria-label="Delete item">
            <GsIcon><DeleteIcon /></GsIcon>
          </GsButton>
        </template>
        <template #default="{ close }">
          <GsPopoverTitle>Delete Item</GsPopoverTitle>
          <GsPopoverContent>Are you sure you want to delete this item?</GsPopoverContent>
          <GsPopoverFooter>
            <GsPopoverClose><GsButton variant="flat">Cancel</GsButton></GsPopoverClose>
            <GsButton variant="filled" @click="close">CTA</GsButton>
          </GsPopoverFooter>
        </template>
      </GsPopover>`,
  }),
}

export const CustomComposition: Story = {
  render: (args) => ({
    components: { GsPopover, GsPopoverTitle, GsPopoverContent, GsButton, GsCheckbox },
    setup: () => ({ args }),
    template: `
      <GsPopover v-bind="args" :classes="{ popover: 'min-w-sm' }">
        <template #trigger><GsButton variant="flat">Settings</GsButton></template>
        <GsPopoverTitle>Notification Settings</GsPopoverTitle>
        <GsPopoverContent class="flex flex-col gap-s">
          <GsCheckbox>Email Notifications</GsCheckbox>
          <GsCheckbox>Push Notifications</GsCheckbox>
          <GsCheckbox>SMS Notifications</GsCheckbox>
        </GsPopoverContent>
      </GsPopover>`,
  }),
}
