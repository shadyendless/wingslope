import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PlaceholderIcon } from '@wingbrace/glideslope-icons'
import { ref } from 'vue'
import GsIcon from '../icon/GsIcon.vue'
import GsAccordion from './GsAccordion.vue'
import GsAccordionGroup from './GsAccordionGroup.vue'
import GsAccordionHeader from './GsAccordionHeader.vue'
import GsAccordionPanel from './GsAccordionPanel.vue'
import GsAccordionTrigger from './GsAccordionTrigger.vue'

const parts = {
  GsAccordionGroup,
  GsAccordion,
  GsAccordionHeader,
  GsAccordionTrigger,
  GsAccordionPanel,
  GsIcon,
  PlaceholderIcon,
}

const sections = [
  { value: 'one', title: 'Accordion one' },
  { value: 'two', title: 'Accordion two' },
  { value: 'three', title: 'Accordion three' },
]

const accordions = `
  <GsAccordion v-for="section in sections" :key="section.value" :value="section.value">
    <GsAccordionHeader>
      <GsAccordionTrigger>
        <GsIcon><PlaceholderIcon /></GsIcon>
        {{ section.title }}
      </GsAccordionTrigger>
    </GsAccordionHeader>
    <GsAccordionPanel>
      <p class="fg-primary-muted text-body-s">
        This is a placeholder content for an accordion. Please replace with an actual content
        instance.
      </p>
    </GsAccordionPanel>
  </GsAccordion>`

/**
 * The accordion group will stretch to fill the entire width of its parent container.
 */
const meta = {
  title: 'Components/AccordionGroup',
  component: GsAccordionGroup,
  args: {
    multiple: false,
    variant: 'cozy',
    disabled: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['cozy', 'compact'],
    },
  },
  parameters: {
    docs: {
      subtitle: 'Group together multiple <GsAccordion> components.',
    },
  },
} satisfies Meta<typeof GsAccordionGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args, sections }),
    template: `
      <div class="w-[280px]">
        <GsAccordionGroup v-bind="args">${accordions}</GsAccordionGroup>
      </div>`,
  }),
}

/**
 * Glideslope extra: `v-model` holds the open section's `value`, or an array of values when
 * `multiple`.
 */
export const Controlled: Story = {
  args: { multiple: true },
  argTypes: { multiple: { control: false } },
  render: (args) => ({
    components: parts,
    setup: () => ({ args, sections, open: ref<string | string[]>(['two']) }),
    template: `
      <div class="flex w-[280px] flex-col gap-m">
        <GsAccordionGroup v-bind="args" v-model="open">${accordions}</GsAccordionGroup>
        <span class="fg-primary-muted text-body-s">open: {{ open ?? 'none' }}</span>
      </div>`,
  }),
}
