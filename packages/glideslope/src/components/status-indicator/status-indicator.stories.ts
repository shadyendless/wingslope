import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsTooltip from '../tooltip/GsTooltip.vue'
import GsStatusIndicator from './GsStatusIndicator.vue'
import type { GsStatus } from './types'

const meta = {
  title: 'Components/StatusIndicator',
  component: GsStatusIndicator,
  args: {
    status: 'good',
    label: 'Custom text',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['good', 'degraded', 'poor', 'pending', 'unknown'],
    },
  },
} satisfies Meta<typeof GsStatusIndicator>

export default meta
type Story = StoryObj<typeof meta>

const statuses: GsStatus[] = ['good', 'degraded', 'poor', 'pending', 'unknown']

/** Every status with its name below it. Shown on the docs page only. */
export const Demo: Story = {
  tags: ['!dev'],
  render: () => ({
    components: { GsStatusIndicator },
    setup: () => ({ statuses }),
    template: `
      <div class="flex gap-xl">
        <div
          v-for="status in statuses"
          :key="status"
          class="flex flex-col items-center justify-center gap-s"
        >
          <GsStatusIndicator :status="status" />
          <span class="fg-primary-bold text-body-s capitalize" aria-hidden="true">{{ status }}</span>
        </div>
      </div>`,
  }),
}

export const Default: Story = {
  render: (args) => ({
    components: { GsStatusIndicator },
    setup: () => ({ args }),
    template: `
      <div class="flex gap-xl">
        <GsStatusIndicator v-bind="args" />
      </div>`,
  }),
}

export const WithLabel: Story = {
  render: () => ({
    components: { GsStatusIndicator },
    template: `
      <div class="flex flex-col gap-s">
        <GsStatusIndicator status="good" label="System online" />
        <GsStatusIndicator status="degraded" label="Degraded connectivity" />
        <GsStatusIndicator status="poor" label="Poor connectivity" />
        <GsStatusIndicator status="pending" label="Standby" />
        <GsStatusIndicator status="unknown" label="Off" />
      </div>`,
  }),
}

/** The indicator is focusable here so keyboard users can open the tooltip too. */
export const WithTooltip: Story = {
  render: () => ({
    components: { GsStatusIndicator, GsTooltip },
    template: `
      <div class="p-m">
        <GsTooltip>
          <template #trigger>
            <GsStatusIndicator status="degraded" tabindex="0" />
          </template>
          System unstable. Double check connection.
        </GsTooltip>
      </div>`,
  }),
}

const defaultData: { id: string; siteName: string; status: GsStatus; lastUpdated: string }[] = [
  {
    id: 'site-001',
    siteName: 'North Ridge Station',
    status: 'good',
    lastUpdated: '2026-01-27T00:00:00Z',
  },
  {
    id: 'site-002',
    siteName: 'Coastal Watchpoint',
    status: 'degraded',
    lastUpdated: '2026-01-27T00:00:00Z',
  },
  {
    id: 'site-003',
    siteName: 'High Desert Array',
    status: 'good',
    lastUpdated: '2026-01-27T00:00:00Z',
  },
  {
    id: 'site-004',
    siteName: 'Arctic Relay Node',
    status: 'poor',
    lastUpdated: '2026-01-27T00:00:00Z',
  },
  {
    id: 'site-005',
    siteName: 'Southern Valley Outpost',
    status: 'degraded',
    lastUpdated: '2026-01-27T00:00:00Z',
  },
]

/** Glideslope has no table component, so this uses a plain HTML table. */
export const InTable: Story = {
  render: () => ({
    components: { GsStatusIndicator },
    setup: () => ({ sites: defaultData }),
    template: `
      <table class="fg-primary-bold text-body-s">
        <thead class="fg-primary-muted text-header-xs">
          <tr>
            <th class="px-s py-xs text-left">Status</th>
            <th class="px-s py-xs text-left">Site Name</th>
            <th class="px-s py-xs text-left">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="site in sites" :key="site.id">
            <td class="px-s py-xs"><GsStatusIndicator :status="site.status" /></td>
            <td class="px-s py-xs">{{ site.siteName }}</td>
            <td class="px-s py-xs">{{ site.lastUpdated }}</td>
          </tr>
        </tbody>
      </table>`,
  }),
}
