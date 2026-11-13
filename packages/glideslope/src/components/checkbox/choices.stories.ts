import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import GsRadio from '../radio/GsRadio.vue'
import GsRadioGroup from '../radio/GsRadioGroup.vue'
import GsSwitch from '../switch/GsSwitch.vue'
import GsCheckbox from './GsCheckbox.vue'
import GsCheckboxGroup from './GsCheckboxGroup.vue'

const meta = {
  title: 'Components/Checkbox',
  component: GsCheckbox,
  args: { disabled: false, labelPosition: 'end' },
  argTypes: { labelPosition: { control: 'inline-radio', options: ['end', 'start'] } },
  render: (args) => ({
    components: { GsCheckbox },
    setup: () => ({ args, checked: ref(false) }),
    template: '<GsCheckbox v-bind="args" v-model="checked">I have read the briefing</GsCheckbox>',
  }),
} satisfies Meta<typeof GsCheckbox>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const States: Story = {
  render: () => ({
    components: { GsCheckbox },
    template: `
      <div class="flex flex-col gap-s">
        <GsCheckbox :model-value="false">Unchecked</GsCheckbox>
        <GsCheckbox :model-value="true">Checked</GsCheckbox>
        <GsCheckbox model-value="indeterminate">Indeterminate</GsCheckbox>
        <GsCheckbox :model-value="false" disabled>Disabled</GsCheckbox>
        <GsCheckbox :model-value="true" disabled>Disabled checked</GsCheckbox>
      </div>`,
  }),
}

export const Group: Story = {
  render: () => ({
    components: { GsCheckbox, GsCheckboxGroup },
    setup: () => ({ layers: ref(['tracks']) }),
    template: `
      <div class="flex flex-col gap-l">
        <GsCheckboxGroup v-model="layers" label="Map layers">
          <GsCheckbox value="tracks">Tracks</GsCheckbox>
          <GsCheckbox value="airspace">Airspace</GsCheckbox>
          <GsCheckbox value="terrain">Terrain</GsCheckbox>
        </GsCheckboxGroup>
        <span class="text-body-s fg-primary-muted">{{ layers }}</span>
      </div>`,
  }),
}

export const RadioGroup: Story = {
  render: () => ({
    components: { GsRadio, GsRadioGroup },
    setup: () => ({ units: ref('metric') }),
    template: `
      <div class="flex flex-col gap-l">
        <GsRadioGroup v-model="units" label="Units" required>
          <GsRadio value="metric">Metric</GsRadio>
          <GsRadio value="imperial">Imperial</GsRadio>
          <GsRadio value="nautical" disabled>Nautical (unavailable)</GsRadio>
        </GsRadioGroup>
        <GsRadioGroup v-model="units" label="Units, horizontal" orientation="horizontal" label-position="start">
          <GsRadio value="metric">Metric</GsRadio>
          <GsRadio value="imperial">Imperial</GsRadio>
        </GsRadioGroup>
      </div>`,
  }),
}

export const Switch: Story = {
  render: () => ({
    components: { GsSwitch },
    setup: () => ({ grid: ref(true), labels: ref(false) }),
    template: `
      <div class="flex flex-col gap-s">
        <GsSwitch v-model="grid">Show grid</GsSwitch>
        <GsSwitch v-model="labels" label-position="start">Show labels</GsSwitch>
        <GsSwitch :model-value="true" disabled>Locked on</GsSwitch>
      </div>`,
  }),
}
