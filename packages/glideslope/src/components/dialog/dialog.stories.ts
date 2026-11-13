import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsTextField from '../text-field/GsTextField.vue'
import GsDialog from './GsDialog.vue'
import GsDialogClose from './GsDialogClose.vue'
import GsDialogContent from './GsDialogContent.vue'
import GsDialogFooter from './GsDialogFooter.vue'
import GsDialogTitle from './GsDialogTitle.vue'

const parts = { GsDialog, GsDialogTitle, GsDialogContent, GsDialogFooter, GsDialogClose, GsButton }

const meta = {
  title: 'Components/Dialog',
  component: GsDialog,
  args: {
    size: 'small',
    dismissable: true,
    keyboardDismissDisabled: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'large'],
    },
    dismissable: {
      control: 'boolean',
    },
    keyboardDismissDisabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof GsDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: parts,
    // NOTE: the container ref is only for Storybook; in an app the dialog renders into `body`.
    setup: () => ({ args, container: ref<HTMLElement>() }),
    template: `
      <div ref="container" class="relative h-[800px] w-[600px] p-l outline outline-info-bold">
        <GsDialog v-bind="args" :portal-to="container">
          <template #trigger><GsButton>Press Me</GsButton></template>
          <GsDialogTitle>Dialog Title</GsDialogTitle>
          <GsDialogContent>Lorum Ipsum text for the dialog shall go here.</GsDialogContent>
          <GsDialogFooter>
            <GsDialogClose><GsButton variant="flat">Action 2</GsButton></GsDialogClose>
            <GsDialogClose><GsButton>Action 1</GsButton></GsDialogClose>
          </GsDialogFooter>
        </GsDialog>
      </div>`,
  }),
}

export const LocalPortal: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ panel: ref<HTMLElement>() }),
    template: `
      <div class="flex h-[600px] w-[960px] outline outline-info-bold">
        <div class="w-full p-l">
          <GsDialog :portal-to="panel">
            <template #trigger><GsButton>Press Me</GsButton></template>
            <GsDialogTitle>Dialog Title</GsDialogTitle>
            <GsDialogContent>Lorum Ipsum text for the dialog shall go here.</GsDialogContent>
            <GsDialogFooter>
              <GsDialogClose><GsButton variant="flat">Action 2</GsButton></GsDialogClose>
              <GsDialogClose><GsButton>Action 1</GsButton></GsDialogClose>
            </GsDialogFooter>
          </GsDialog>
        </div>
        <div ref="panel" class="relative h-full w-[500px] bg-info-bold" />
      </div>`,
  }),
}

export const Controlled: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ open: ref(false) }),
    template: `
      <div class="h-[800px] w-[600px] p-l outline outline-info-bold">
        <GsDialog v-model:open="open">
          <template #trigger><GsButton disabled>Disabled</GsButton></template>
          <GsDialogTitle>Dialog Title</GsDialogTitle>
          <GsDialogContent>Lorum Ipsum text for the dialog shall go here.</GsDialogContent>
          <GsDialogFooter>
            <GsDialogClose><GsButton variant="flat">Action 2</GsButton></GsDialogClose>
            <GsDialogClose><GsButton>Action 1</GsButton></GsDialogClose>
          </GsDialogFooter>
        </GsDialog>
        <GsButton @click="open = true">Press Me</GsButton>
      </div>`,
  }),
}

/**
 * The default slot's `close` closes the dialog from code, for example after a form submits.
 * Without a `#trigger`, the dialog opens only through `v-model:open`.
 */
export const CloseFromSlot: Story = {
  args: { size: 'large' },
  render: (args) => ({
    components: { ...parts, GsTextField },
    setup: () => ({ args, open: ref(false), callsign: ref('') }),
    template: `
      <GsButton @click="open = true">Rename track</GsButton>
      <GsDialog v-bind="args" v-model:open="open">
        <template #default="{ close }">
          <form @submit.prevent="close">
            <GsDialogTitle>Rename track</GsDialogTitle>
            <GsDialogContent>
              <GsTextField v-model="callsign" label="Callsign" placeholder="RAVEN 21" required />
            </GsDialogContent>
            <GsDialogFooter>
              <GsButton variant="flat" type="button" @click="close">Cancel</GsButton>
              <GsButton color="accent" type="submit">Save</GsButton>
            </GsDialogFooter>
          </form>
        </template>
      </GsDialog>`,
  }),
}
