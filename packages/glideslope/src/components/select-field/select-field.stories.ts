import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PlaceholderIcon } from '@wingbrace/glideslope-icons'
import { ref } from 'vue'
import GsIcon from '../icon/GsIcon.vue'
import GsOption from '../options/GsOption.vue'
import GsOptionLabel from '../options/GsOptionLabel.vue'
import GsOptionSection from '../options/GsOptionSection.vue'
import { provideSelectFieldDefaults } from './defaults'
import GsSelectField from './GsSelectField.vue'

const parts = {
  GsSelectField,
  GsOption,
  GsOptionLabel,
  GsOptionSection,
  GsIcon,
  PlaceholderIcon,
}

const meta = {
  title: 'Components/SelectField',
  component: GsSelectField,
  args: {
    label: 'Label',
    description: 'Helper text',
    errorMessage: '',
    size: 'medium',
    disabled: false,
    invalid: false,
    required: true,
    readonly: false,
    placeholder: 'Select...',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['medium', 'small'],
    },
  },
  parameters: {
    docs: {
      subtitle: 'Dropdown select with form field features',
    },
  },
} satisfies Meta<typeof GsSelectField>

export default meta
type Story = StoryObj<typeof meta>

const option = (value: string, name: string, extra = '') => `
  <GsOption value="${value}" text-value="${name}"${extra}>
    <GsIcon><PlaceholderIcon /></GsIcon>
    <GsOptionLabel>${name}</GsOptionLabel>
  </GsOption>`

const animals = [
  option('koala', 'Koala'),
  option('kangaroo', 'Kangaroo'),
  option('platypus', 'Platypus'),
  option('bison', 'Bison'),
].join('')

/** Options can carry icons and sit in sections. Only the `GsOptionLabel` shows in the trigger. */
export const Default: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args }),
    template: `
      <GsSelectField v-bind="args">
        <GsOptionSection header="North American Birds">
          ${option('blue-jay', 'Blue Jay')}
          ${option('gray-catbird', 'Gray catbird', ' color="serious"')}
          ${option('black-capped-chickadee', 'Black-capped chickadee', ' color="critical"')}
          ${option('song-sparrow', 'Song Sparrow')}
        </GsOptionSection>
        <GsOptionSection header="African Birds">
          ${option('lilac-breasted-roller', 'Lilac-breasted roller')}
          ${option('hornbill', 'Hornbill')}
        </GsOptionSection>
      </GsSelectField>`,
  }),
}

/** `v-model` holds the `value` of the selected option. */
export const ControlledSelection: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args, value: ref('bison') }),
    template: `
      <div class="flex flex-col gap-s">
        <GsSelectField v-bind="args" v-model="value">${animals}</GsSelectField>
        <span class="text-body-s fg-primary-muted">value: {{ value }}</span>
      </div>`,
  }),
}

export const Readonly: Story = {
  args: { readonly: true },
  render: (args) => ({
    components: parts,
    setup: () => ({ args, value: ref('platypus') }),
    template: `<GsSelectField v-bind="args" v-model="value" readonly>${animals}</GsSelectField>`,
  }),
}

/**
 * Glideslope extra: `provideSelectFieldDefaults()` sets the size, `disabled` and `readonly` of
 * every select below the calling component. A prop set on a select still wins.
 */
export const Provider: Story = {
  args: { size: 'small' },
  render: (args) => ({
    components: parts,
    setup: () => {
      provideSelectFieldDefaults(() => ({ size: args.size, disabled: args.disabled }))
      return {}
    },
    template: `
      <div class="flex flex-col gap-m">
        <GsSelectField label="Small Select 1" placeholder="Select...">${animals}</GsSelectField>
        <GsSelectField label="Small Select 2" placeholder="Select...">${animals}</GsSelectField>
      </div>`,
  }),
}
