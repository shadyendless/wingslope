import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PlaceholderIcon } from '@wingbrace/glideslope-icons'
import { ref } from 'vue'
import GsIcon from '../icon/GsIcon.vue'
import GsOption from './GsOption.vue'
import GsOptionContent from './GsOptionContent.vue'
import GsOptionDescription from './GsOptionDescription.vue'
import GsOptionLabel from './GsOptionLabel.vue'
import GsOptions from './GsOptions.vue'
import GsOptionSection from './GsOptionSection.vue'
import type { GsOptionProps } from './types'

const parts = {
  GsOptions,
  GsOption,
  GsOptionSection,
  GsOptionContent,
  GsOptionLabel,
  GsOptionDescription,
  GsIcon,
  PlaceholderIcon,
}

const meta = {
  title: 'Components/Options',
  component: GsOptions,
  args: {
    size: 'large',
    selectionMode: 'none',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'large'],
    },
    selectionMode: {
      control: 'select',
      options: ['none', 'single', 'multiple'],
    },
  },
} satisfies Meta<typeof GsOptions>

export default meta
type Story = StoryObj<typeof meta>

interface CustomOptionsItem {
  id: number
  name: string
  description?: string
  disabled?: boolean
  prefixIcon?: boolean
  suffixIcon?: boolean
  children?: CustomOptionsItem[]
  color?: GsOptionProps['color']
}

const items: CustomOptionsItem[] = [
  { id: 1, prefixIcon: true, name: 'Red Panda', description: 'Tree-dwelling mammal' },
  { id: 2, prefixIcon: true, name: 'Cat', description: 'Furry house pet', disabled: true },
  {
    id: 3,
    prefixIcon: true,
    name: 'Dog',
    description: 'Loyal companion',
    suffixIcon: true,
    color: 'serious',
  },
  {
    id: 4,
    prefixIcon: true,
    name: 'Aardvark',
    description: 'Ant-eating nocturnal',
    color: 'critical',
  },
  { id: 5, name: 'Kangaroo', description: 'Pouch-bearing jumper' },
  { id: 6, prefixIcon: true, name: 'Snake', description: 'Slithering reptile' },
]

const itemsWithSections: CustomOptionsItem[] = [
  {
    id: 1,
    prefixIcon: true,
    name: 'North American Birds',
    children: [
      { id: 2, prefixIcon: true, name: 'Blue jay' },
      { id: 3, prefixIcon: true, name: 'Gray catbird' },
      { id: 4, prefixIcon: true, name: 'Black-capped chickadee' },
      { id: 5, prefixIcon: true, name: 'Song sparrow' },
    ],
  },
  {
    id: 6,
    prefixIcon: true,
    name: 'African Birds',
    children: [
      { id: 7, prefixIcon: true, name: 'Lilac-breasted roller' },
      { id: 8, prefixIcon: true, name: 'Hornbill' },
    ],
  },
]

/** One data item rendered as an option, used by the data-driven stories. */
const itemOption = `
  <GsOption
    :value="item.id"
    :text-value="item.name"
    :disabled="item.disabled"
    :color="item.color"
  >
    <GsIcon v-if="item.prefixIcon"><PlaceholderIcon /></GsIcon>
    <GsOptionContent>
      <GsOptionLabel>{{ item.name }}</GsOptionLabel>
      <GsOptionDescription v-if="item.description">{{ item.description }}</GsOptionDescription>
    </GsOptionContent>
    <GsIcon v-if="item.suffixIcon"><PlaceholderIcon /></GsIcon>
  </GsOption>`

export const Default: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args, items }),
    template: `
      <GsOptions v-bind="args" aria-label="Animals">
        <template v-for="item in items" :key="item.id">${itemOption}</template>
      </GsOptions>`,
  }),
}

export const WithDynamicSections: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args, sections: itemsWithSections }),
    template: `
      <GsOptions v-bind="args" aria-label="Birds">
        <GsOptionSection v-for="section in sections" :key="section.id" :header="section.name">
          <template v-for="item in section.children" :key="item.id">${itemOption}</template>
        </GsOptionSection>
      </GsOptions>`,
  }),
}

const bird = (value: string, name: string, extra = '') => `
  <GsOption value="${value}" text-value="${name}"${extra}>
    <GsIcon><PlaceholderIcon /></GsIcon>
    <GsOptionLabel>${name}</GsOptionLabel>
  </GsOption>`

const describedBird = (value: string, name: string, extra = '') => `
  <GsOption value="${value}" text-value="${name}"${extra}>
    <GsIcon><PlaceholderIcon /></GsIcon>
    <GsOptionLabel>${name}</GsOptionLabel>
    <GsOptionDescription>A cool bird</GsOptionDescription>
  </GsOption>`

export const WithStaticSections: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args, value: ref(['selected-1', 'selected-2', 'selected-3']) }),
    template: `
      <GsOptions v-bind="args" v-model="value" selection-mode="multiple" aria-label="Birds">
        <GsOptionSection header="North American Birds" class="w-[200px]">
          ${bird('blue-jay', 'Blue Jay')}
          ${describedBird('gray-catbird', 'Gray catbird', ' color="serious"')}
          ${bird('black-capped-chickadee', 'Black-capped chickadee', ' color="critical"')}
          ${bird('song-sparrow', 'Song Sparrow')}
          ${describedBird('selected-1', 'Gray catbird', ' color="serious"')}
          ${bird('selected-2', 'Black-capped chickadee', ' color="critical"')}
          ${bird('selected-3', 'Song Sparrow')}
        </GsOptionSection>
        <GsOptionSection header="African Birds">
          ${bird('lilac-breasted-roller', 'Lilac-breasted roller')}
          ${bird('hornbill', 'Hornbill')}
        </GsOptionSection>
      </GsOptions>`,
  }),
}

const stateOption = (value: string, label: string, description: string, extra = '') => `
  <GsOption value="${value}" text-value="${label}"${extra}>
    <GsIcon><PlaceholderIcon /></GsIcon>
    <GsOptionContent>
      <GsOptionLabel>${label}</GsOptionLabel>
      <GsOptionDescription>${description}</GsOptionDescription>
    </GsOptionContent>
  </GsOption>`

/** `v-model` holds the selected values; with `selection-mode="multiple"` it is an array. */
export const WithSelectionState: Story = {
  args: {
    selectionMode: 'multiple',
  },
  render: (args) => ({
    components: parts,
    setup: () => ({
      args,
      value: ref(['selected-info', 'selected-serious', 'selected-critical', 'disabled-selected']),
    }),
    template: `
      <div class="flex flex-col gap-s">
        <GsOptions v-bind="args" v-model="value" aria-label="Selection states">
          ${stateOption('unselected', 'Unselected Item', 'Default unselected state')}
          ${stateOption('selected-info', 'Selected Info', 'Selected with info color (default)')}
          ${stateOption('selected-serious', 'Selected Serious', 'Selected with serious color', ' color="serious"')}
          ${stateOption('selected-critical', 'Selected Critical', 'Selected with critical color', ' color="critical"')}
          ${stateOption('disabled-unselected', 'Disabled Unselected', 'Disabled and unselected', ' disabled')}
          ${stateOption('disabled-selected', 'Disabled Selected', 'Disabled but selected', ' disabled')}
        </GsOptions>
        <span class="text-body-s fg-primary-muted">value: {{ value }}</span>
      </div>`,
  }),
}
