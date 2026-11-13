import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsDetailsList from './GsDetailsList.vue'
import GsDetailsListLabel from './GsDetailsListLabel.vue'
import GsDetailsListValue from './GsDetailsListValue.vue'

const rows = [
  ['Callsign', 'RAVEN 21'],
  ['Altitude', '24,000 ft'],
  ['Heading', '274°'],
  ['Speed', '420 kt'],
]

const meta = {
  title: 'Components/DetailsList',
  component: GsDetailsList,
  args: { align: 'justify' },
  argTypes: { align: { control: 'inline-radio', options: ['justify', 'center', 'left'] } },
  render: (args) => ({
    components: { GsDetailsList, GsDetailsListLabel, GsDetailsListValue },
    setup: () => ({ args, rows }),
    template: `
      <div style="width: 280px">
        <GsDetailsList v-bind="args">
          <template v-for="[label, value] in rows" :key="label">
            <GsDetailsListLabel>{{ label }}</GsDetailsListLabel>
            <GsDetailsListValue>{{ value }}</GsDetailsListValue>
          </template>
        </GsDetailsList>
      </div>`,
  }),
} satisfies Meta<typeof GsDetailsList>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
