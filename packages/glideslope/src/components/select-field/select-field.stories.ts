import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { AirportIcon, HelicopterIcon, LargeJetIcon } from '@wingbrace/glideslope-icons'
import { ref } from 'vue'
import GsIcon from '../icon/GsIcon.vue'
import GsOption from '../options/GsOption.vue'
import GsOptionContent from '../options/GsOptionContent.vue'
import GsOptionDescription from '../options/GsOptionDescription.vue'
import GsOptionLabel from '../options/GsOptionLabel.vue'
import GsOptions from '../options/GsOptions.vue'
import GsOptionSection from '../options/GsOptionSection.vue'
import GsComboBoxField from './GsComboBoxField.vue'
import GsSelectField from './GsSelectField.vue'

const optionComponents = {
  GsOption,
  GsOptionSection,
  GsOptionContent,
  GsOptionLabel,
  GsOptionDescription,
  GsIcon,
}

const meta = {
  title: 'Components/SelectField',
  component: GsSelectField,
  args: {
    label: 'Affiliation',
    placeholder: 'Choose one',
    description: 'How the track is classified',
    size: 'medium',
    disabled: false,
    readonly: false,
    required: false,
    errorMessage: '',
  },
  argTypes: { size: { control: 'inline-radio', options: ['medium', 'small'] } },
  render: (args) => ({
    components: { GsSelectField, ...optionComponents },
    setup: () => ({ args, value: ref<string>() }),
    template: `
      <GsSelectField v-bind="args" v-model="value">
        <GsOption value="friend" label="Friend" />
        <GsOption value="neutral" label="Neutral" />
        <GsOption value="unknown" label="Unknown" color="serious" />
        <GsOption value="hostile" label="Hostile" color="critical" />
      </GsSelectField>`,
  }),
} satisfies Meta<typeof GsSelectField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Options can carry icons, descriptions and sections. Only the label shows in the trigger. */
export const RichOptions: Story = {
  args: { label: 'Aircraft', placeholder: 'Select aircraft' },
  render: (args) => ({
    components: { GsSelectField, ...optionComponents, LargeJetIcon, HelicopterIcon },
    setup: () => ({ args, value: ref('raven') }),
    template: `
      <GsSelectField v-bind="args" v-model="value">
        <GsOptionSection header="Fixed wing">
          <GsOption value="raven" text-value="RAVEN 21">
            <GsIcon><LargeJetIcon /></GsIcon>
            <GsOptionContent>
              <GsOptionLabel>RAVEN 21</GsOptionLabel>
              <GsOptionDescription>F-16C · 24,000 ft</GsOptionDescription>
            </GsOptionContent>
          </GsOption>
          <GsOption value="viper" text-value="VIPER 11">
            <GsIcon><LargeJetIcon /></GsIcon>
            <GsOptionContent>
              <GsOptionLabel>VIPER 11</GsOptionLabel>
              <GsOptionDescription>F-35A · 31,000 ft</GsOptionDescription>
            </GsOptionContent>
          </GsOption>
        </GsOptionSection>
        <GsOptionSection header="Rotary wing">
          <GsOption value="dustoff" text-value="DUSTOFF 4">
            <GsIcon><HelicopterIcon /></GsIcon>
            <GsOptionContent>
              <GsOptionLabel>DUSTOFF 4</GsOptionLabel>
              <GsOptionDescription>UH-60 · 1,500 ft</GsOptionDescription>
            </GsOptionContent>
          </GsOption>
        </GsOptionSection>
      </GsSelectField>`,
  }),
}

export const ComboBox: Story = {
  render: () => ({
    components: { GsComboBoxField, GsOption, GsIcon, AirportIcon },
    setup: () => ({ value: ref('KDEN'), search: ref('') }),
    template: `
      <div class="flex flex-col gap-s" style="width: 320px">
        <GsComboBoxField v-model="value" v-model:search="search" label="Destination" placeholder="Search airports">
          <GsOption value="KDEN" label="Denver International" />
          <GsOption value="KSEA" label="Seattle-Tacoma International" />
          <GsOption value="KSFO" label="San Francisco International" />
          <GsOption value="KLAX" label="Los Angeles International" />
          <GsOption value="KORD" label="Chicago O'Hare International" />
        </GsComboBoxField>
        <span class="text-body-s fg-primary-muted">value: {{ value }}</span>
      </div>`,
  }),
}

export const OptionsList: Story = {
  render: () => ({
    components: { GsOptions, GsOption },
    setup: () => ({ value: ref(['friend']) }),
    template: `
      <div class="flex flex-col gap-s" style="width: 240px">
        <GsOptions v-model="value" multiple aria-label="Affiliations">
          <GsOption value="friend" label="Friend" />
          <GsOption value="neutral" label="Neutral" />
          <GsOption value="hostile" label="Hostile" color="critical" />
        </GsOptions>
        <span class="text-body-s fg-primary-muted">{{ value }}</span>
      </div>`,
  }),
}
