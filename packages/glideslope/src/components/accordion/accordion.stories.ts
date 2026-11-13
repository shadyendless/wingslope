import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PlaceholderIcon } from '@wingbrace/glideslope-icons'
import { ref } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsMenu from '../menu/GsMenu.vue'
import GsMenuItem from '../menu/GsMenuItem.vue'
import GsAccordion from './GsAccordion.vue'
import GsAccordionHeader from './GsAccordionHeader.vue'
import GsAccordionPanel from './GsAccordionPanel.vue'
import GsAccordionTrigger from './GsAccordionTrigger.vue'

const parts = {
  GsAccordion,
  GsAccordionHeader,
  GsAccordionTrigger,
  GsAccordionPanel,
  GsIcon,
  PlaceholderIcon,
}

const panel = `
  <GsAccordionPanel>
    <p class="fg-primary-muted text-body-s">
      This is a placeholder content for an accordion. Please replace with an actual content
      instance.
    </p>
  </GsAccordionPanel>`

const trigger = `
  <GsAccordionTrigger>
    <GsIcon><PlaceholderIcon /></GsIcon>
    Accordion title
  </GsAccordionTrigger>`

/**
 * The accordion will stretch to fill the entire width of its parent container.
 */
const meta = {
  title: 'Components/Accordion',
  component: GsAccordion,
  args: {
    disabled: false,
    variant: 'cozy',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['cozy', 'compact'],
    },
  },
  parameters: {
    docs: {
      subtitle: 'Content that can expand and collapse.',
    },
  },
} satisfies Meta<typeof GsAccordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args }),
    template: `
      <div class="w-[280px]">
        <GsAccordion v-bind="args">
          <GsAccordionHeader>${trigger}</GsAccordionHeader>
          ${panel}
        </GsAccordion>
      </div>`,
  }),
}

export const WithMenu: Story = {
  render: (args) => ({
    components: { ...parts, GsButton, GsMenu, GsMenuItem },
    setup: () => ({ args }),
    template: `
      <div class="w-[280px]">
        <GsAccordion v-bind="args">
          <GsAccordionHeader>
            ${trigger}
            <GsMenu>
              <template #trigger><GsButton aria-label="Accordion actions" /></template>
              <GsMenuItem label="Foo" />
              <GsMenuItem label="Bar" />
            </GsMenu>
          </GsAccordionHeader>
          ${panel}
        </GsAccordion>
      </div>`,
  }),
}

/** Glideslope extra: `v-model:open` controls a standalone accordion's open state. */
export const Controlled: Story = {
  render: (args) => ({
    components: { ...parts, GsButton },
    setup: () => ({ args, open: ref(true) }),
    template: `
      <div class="flex w-[280px] flex-col gap-m">
        <GsAccordion v-bind="args" v-model:open="open">
          <GsAccordionHeader>${trigger}</GsAccordionHeader>
          ${panel}
        </GsAccordion>
        <div class="flex items-center gap-s">
          <GsButton variant="outline" size="small" @click="open = !open">Toggle</GsButton>
          <span class="fg-primary-muted text-body-s">open: {{ open }}</span>
        </div>
      </div>`,
  }),
}
