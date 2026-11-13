import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { LassoIcon, SettingsIcon } from '@wingbrace/glideslope-icons'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsTooltip from './GsTooltip.vue'
import GsTooltipProvider from './GsTooltipProvider.vue'

const sides = ['top', 'right', 'bottom', 'left']

const meta = {
  title: 'Components/Tooltip',
  component: GsTooltip,
  args: { side: 'bottom', align: 'center', offset: 4, delay: 250, disabled: false },
  argTypes: {
    side: { control: 'select', options: sides },
    align: { control: 'select', options: ['start', 'center', 'end'] },
  },
  parameters: {
    docs: {
      subtitle: 'Contextual popup for additional information on hover or focus',
    },
  },
} satisfies Meta<typeof GsTooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsTooltip },
    setup: () => ({ args }),
    template: `
      <div class="p-m">
        <GsTooltip v-bind="args">
          <template #trigger><span class="fg-primary-bold" tabindex="0">Test</span></template>
          My tooltip
        </GsTooltip>
      </div>`,
  }),
}

export const LongTooltip: Story = {
  render: () => ({
    components: { GsTooltip },
    template: `
      <div class="p-m">
        <GsTooltip>
          <template #trigger><span class="fg-primary-bold" tabindex="0">Long Tooltip</span></template>
          A floating label used to explain an element
        </GsTooltip>
      </div>`,
  }),
}

export const TooltipWithButton: Story = {
  render: () => ({
    components: { GsTooltip, GsButton },
    template: `
      <div class="p-m">
        <GsTooltip>
          <template #trigger><GsButton>My Button</GsButton></template>
          My tooltip
        </GsTooltip>
      </div>`,
  }),
}

export const TooltipWithIcon: Story = {
  render: () => ({
    components: { GsTooltip, GsIcon, LassoIcon },
    template: `
      <div class="p-m">
        <GsTooltip>
          <template #trigger>
            <GsIcon size="large" class="fg-primary-bold" tabindex="0" role="img" aria-label="Lasso">
              <LassoIcon />
            </GsIcon>
          </template>
          Lasso Selection
        </GsTooltip>
      </div>`,
  }),
}

/**
 * Tooltips under one `GsTooltipProvider` share their delay: once one is open, moving to the next
 * trigger shows its tooltip at once. Icon-only buttons still need an `aria-label`; the tooltip
 * is a visual hint, not the accessible name.
 */
export const SharedProvider: Story = {
  render: () => ({
    components: { GsTooltip, GsTooltipProvider, GsButton, GsIcon, SettingsIcon },
    setup: () => ({ sides }),
    template: `
      <GsTooltipProvider :delay="400">
        <div class="flex gap-s p-xl">
          <GsTooltip v-for="side in sides" :key="side" :side="side">
            <template #trigger>
              <GsButton variant="icon" :aria-label="'Settings ' + side">
                <GsIcon><SettingsIcon /></GsIcon>
              </GsButton>
            </template>
            Tooltip on the {{ side }}
          </GsTooltip>
        </div>
      </GsTooltipProvider>`,
  }),
}
