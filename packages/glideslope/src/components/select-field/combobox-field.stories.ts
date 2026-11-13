import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PlaceholderIcon } from '@wingbrace/glideslope-icons'
import { computed, ref } from 'vue'
import GsIcon from '../icon/GsIcon.vue'
import GsOption from '../options/GsOption.vue'
import GsOptionContent from '../options/GsOptionContent.vue'
import GsOptionDescription from '../options/GsOptionDescription.vue'
import GsOptionLabel from '../options/GsOptionLabel.vue'
import GsOptionSection from '../options/GsOptionSection.vue'
import { provideComboBoxFieldDefaults } from './defaults'
import GsComboBoxField from './GsComboBoxField.vue'

const parts = {
  GsComboBoxField,
  GsOption,
  GsOptionSection,
  GsOptionContent,
  GsOptionLabel,
  GsOptionDescription,
  GsIcon,
  PlaceholderIcon,
}

const meta = {
  title: 'Components/ComboBoxField',
  component: GsComboBoxField,
  args: {
    description: 'Helper text',
    errorMessage: '',
    label: 'Label',
    placeholder: 'Placeholder',
    size: 'medium',
    disabled: false,
    invalid: false,
    required: true,
    allowCustomValue: false,
    readonly: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['medium', 'small'],
    },
    // Logs typing in the Actions panel. The `update:search` event is documented from the component.
    'onUpdate:search': { action: 'update:search', table: { disable: true } },
  },
} satisfies Meta<typeof GsComboBoxField>

export default meta
type Story = StoryObj<typeof meta>

interface CustomOptionsItem {
  id: number | string
  name: string
  description?: string
  disabled?: boolean
  prefixIcon?: boolean
  children?: CustomOptionsItem[]
}

const items: CustomOptionsItem[] = [
  { id: 1, prefixIcon: true, name: 'Red Panda', description: 'Tree-dwelling mammal' },
  { id: 2, prefixIcon: true, name: 'Cat', description: 'Furry house pet', disabled: true },
  { id: 3, prefixIcon: true, name: 'Dog', description: 'Loyal companion' },
  { id: 4, prefixIcon: true, name: 'Aardvark', description: 'Ant-eating nocturnal' },
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

/** One data item rendered as an option. `text-value` is the text the combobox filters on. */
const itemOption = `
  <GsOption :value="item.id" :text-value="item.name" :disabled="item.disabled">
    <GsIcon v-if="item.prefixIcon"><PlaceholderIcon /></GsIcon>
    <GsOptionContent>
      <GsOptionLabel>{{ item.name }}</GsOptionLabel>
      <GsOptionDescription v-if="item.description">{{ item.description }}</GsOptionDescription>
    </GsOptionContent>
  </GsOption>`

const itemOptions = `<template v-for="item in items" :key="item.id">${itemOption}</template>`

export const Default: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args, items }),
    template: `<GsComboBoxField v-bind="args">${itemOptions}</GsComboBoxField>`,
  }),
}

export const WithDynamicSections: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args, sections: itemsWithSections }),
    template: `
      <GsComboBoxField v-bind="args">
        <GsOptionSection v-for="section in sections" :key="section.id" :header="section.name">
          <template v-for="item in section.children" :key="item.id">${itemOption}</template>
        </GsOptionSection>
      </GsComboBoxField>`,
  }),
}

const bird = (value: string, name: string) => `
  <GsOption value="${value}" text-value="${name}">
    <GsIcon><PlaceholderIcon /></GsIcon>
    <GsOptionLabel>${name}</GsOptionLabel>
  </GsOption>`

export const WithStaticSections: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args }),
    template: `
      <GsComboBoxField v-bind="args">
        <GsOptionSection header="North American Birds">
          ${bird('blue-jay', 'Blue Jay')}
          ${bird('gray-catbird', 'Gray catbird')}
          ${bird('black-capped-chickadee', 'Black-capped chickadee')}
          ${bird('song-sparrow', 'Song Sparrow')}
        </GsOptionSection>
        <GsOptionSection header="African Birds">
          ${bird('lilac-breasted-roller', 'Lilac-breasted roller')}
          ${bird('hornbill', 'Hornbill')}
        </GsOptionSection>
      </GsComboBoxField>`,
  }),
}

export const WithCustomValue: Story = {
  args: {
    allowCustomValue: true,
  },
  render: (args) => ({
    components: parts,
    setup: () => ({ args, items, value: ref<number | string | null>() }),
    template: `
      <div class="space-y-l">
        <GsComboBoxField v-bind="args" v-model="value">${itemOptions}</GsComboBoxField>
        <div class="space-y-s text-body-s">
          <div class="fg-primary-muted">
            Setting allow-custom-value enables you to capture a custom value that will persist on
            blur
          </div>
          <div>value: {{ value }}</div>
        </div>
      </div>`,
  }),
}

/**
 * A read-only combobox shows its value as text that can't be edited, without the clear and list
 * buttons. Here the value is free text (`allow-custom-value`); long text is truncated, with the
 * full text in a tooltip.
 */
export const Readonly: Story = {
  args: { allowCustomValue: true, readonly: true },
  render: (args) => ({
    components: parts,
    setup: () => ({
      args,
      items,
      value: ref('test string long long long long long long long long long long long string'),
    }),
    template: `<GsComboBoxField v-bind="args" v-model="value">${itemOptions}</GsComboBoxField>`,
  }),
}

/**
 * Glideslope extra: `v-model` binds the selected value and `v-model:search` the typed text. The
 * `#empty` slot replaces the "No matches" message.
 */
export const Controlled: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args, items, value: ref<number | string>(3), search: ref('') }),
    template: `
      <div class="flex flex-col gap-s">
        <GsComboBoxField v-bind="args" v-model="value" v-model:search="search">
          ${itemOptions}
          <template #empty>No animal matches "{{ search }}"</template>
        </GsComboBoxField>
        <span class="text-body-s fg-primary-muted">value: {{ value }}, search: "{{ search }}"</span>
      </div>`,
  }),
}

/**
 * Glideslope extra: with `ignore-filter` the combobox shows every option it is given, and the app
 * filters them from `v-model:search`, here to names that start with the typed text.
 */
export const ControlledFiltering: Story = {
  render: (args) => ({
    components: parts,
    setup: () => {
      const search = ref('')
      const filtered = computed(() =>
        items.filter((item) => item.name.toLowerCase().startsWith(search.value.toLowerCase())),
      )
      return { args, items: filtered, value: ref<number | string>(), search }
    },
    template: `
      <GsComboBoxField v-bind="args" v-model="value" v-model:search="search" ignore-filter>
        ${itemOptions}
      </GsComboBoxField>`,
  }),
}

/**
 * Glideslope extra: `provideComboBoxFieldDefaults()` sets the size, `disabled`, `readonly` and
 * `clearable` of every combobox below the calling component. A prop set on a combobox still wins.
 */
export const Provider: Story = {
  args: { size: 'small' },
  render: (args) => ({
    components: parts,
    setup: () => {
      provideComboBoxFieldDefaults(() => ({ size: args.size, disabled: args.disabled }))
      return { items }
    },
    template: `
      <div class="flex flex-col gap-m">
        <GsComboBoxField label="Small Combobox 1">${itemOptions}</GsComboBoxField>
        <GsComboBoxField label="Small Combobox 2">${itemOptions}</GsComboBoxField>
      </div>`,
  }),
}
