import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { AddIcon, CheckIcon, GroupIcon } from '@wingbrace/glideslope-icons'
import { ref } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsTab from './GsTab.vue'
import GsTabList from './GsTabList.vue'
import GsTabPanel from './GsTabPanel.vue'
import GsTabs from './GsTabs.vue'
import { provideTabsDefaults } from './defaults'

const parts = { GsTabs, GsTabList, GsTab, GsTabPanel }

/**
 * The `<GsTabs>` component is built on the `Tabs` component from Reka UI.
 *
 * Please see the documentation for that component <a href="https://reka-ui.com/docs/components/tabs">here</a>.
 *
 * ## Composition Requirements
 *
 * - `GsTabs` must include a `GsTabList`
 */
const meta = {
  title: 'Components/Tabs',
  component: GsTabs,
  args: {
    orientation: 'horizontal',
    align: 'start',
    flex: true,
    activationMode: 'automatic',
    disabled: false,
  },
  argTypes: {
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      if: { arg: 'orientation', eq: 'horizontal' },
    },
    flex: {
      if: { arg: 'orientation', eq: 'horizontal' },
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    activationMode: {
      control: 'select',
      options: ['automatic', 'manual'],
    },
  },
  parameters: {
    docs: {
      subtitle: 'Tab navigation for organizing content into sections',
    },
  },
} satisfies Meta<typeof GsTabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { ...parts, GsButton, GsIcon, AddIcon, CheckIcon, GroupIcon },
    setup: () => {
      // Like the Design Toolkit's TabsProvider, the defaults reach both GsTabs below.
      provideTabsDefaults(() => ({
        orientation: args.orientation,
        activationMode: args.activationMode,
        align: args.align,
        flex: args.flex,
        disabled: args.disabled,
      }))
      return {
        args,
        dimension: ref('300px'),
        textTab: ref('tab-1'),
        iconTab: ref('tab-1'),
      }
    },
    template: `
      <div>
        <div v-if="args.orientation === 'horizontal'" class="mb-oversized flex justify-center gap-m">
          <GsButton @click="dimension = '300px'">Small</GsButton>
          <GsButton @click="dimension = '600px'">Medium</GsButton>
          <GsButton @click="dimension = '1200px'">Large</GsButton>
        </div>
        <div :class="['flex w-full flex-wrap gap-m', args.orientation === 'vertical' ? 'flex-row' : 'flex-col']">
          <div :style="{ width: args.orientation === 'horizontal' ? dimension : 'auto' }">
            <GsTabs v-model="textTab">
              <GsTabList aria-label="Text tabs">
                <GsTab value="tab-1">Tab 1</GsTab>
                <GsTab value="tab-2">Tab 2</GsTab>
                <GsTab value="tab-3">Tab 3</GsTab>
              </GsTabList>
              <GsTabPanel value="tab-1">Panel 1</GsTabPanel>
              <GsTabPanel value="tab-2">Panel 2</GsTabPanel>
              <GsTabPanel value="tab-3">Panel 3</GsTabPanel>
            </GsTabs>
          </div>
          <div :style="{ width: args.orientation === 'horizontal' ? dimension : 'auto' }">
            <GsTabs v-model="iconTab">
              <GsTabList aria-label="Icon tabs">
                <GsTab value="tab-1" aria-label="Add"><GsIcon><AddIcon /></GsIcon></GsTab>
                <GsTab value="tab-2" aria-label="Check"><GsIcon><CheckIcon /></GsIcon></GsTab>
                <GsTab value="tab-3" aria-label="Group"><GsIcon><GroupIcon /></GsIcon></GsTab>
              </GsTabList>
              <GsTabPanel value="tab-1">Panel 1</GsTabPanel>
              <GsTabPanel value="tab-2">Panel 2</GsTabPanel>
              <GsTabPanel value="tab-3">Panel 3</GsTabPanel>
            </GsTabs>
          </div>
        </div>
      </div>`,
  }),
}

/**
 * Glideslope extra: `v-model` holds the selected tab's `value`. A `disabled` tab can't be
 * selected.
 */
export const Controlled: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args, tab: ref('details') }),
    template: `
      <div class="flex w-[400px] flex-col gap-m">
        <GsTabs v-bind="args" v-model="tab">
          <GsTabList aria-label="Track views">
            <GsTab value="details">Details</GsTab>
            <GsTab value="history">History</GsTab>
            <GsTab value="archive" disabled>Archive</GsTab>
          </GsTabList>
          <GsTabPanel value="details">RAVEN 21 · F-16C · 24,000 ft</GsTabPanel>
          <GsTabPanel value="history">Last 24 hours of position reports.</GsTabPanel>
          <GsTabPanel value="archive">Archived reports.</GsTabPanel>
        </GsTabs>
        <span class="fg-primary-muted text-body-s">selected: {{ tab }}</span>
      </div>`,
  }),
}
