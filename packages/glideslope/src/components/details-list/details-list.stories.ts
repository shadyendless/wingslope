import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsDetailsList from './GsDetailsList.vue'
import GsDetailsListLabel from './GsDetailsListLabel.vue'
import GsDetailsListValue from './GsDetailsListValue.vue'
import { provideDetailsListDefaults } from './defaults'

const meta = {
  title: 'Components/DetailsList',
  component: GsDetailsList,
  args: {
    align: 'justify',
  },
  argTypes: {
    align: {
      control: 'select',
      options: ['left', 'justify', 'center'],
    },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A semantic details list component for displaying metadata in key-value pairs. Perfect for map object details, user profiles, or any structured information displayed in sidebars or detail panels.',
      },
    },
  },
} satisfies Meta<typeof GsDetailsList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsDetailsList, GsDetailsListLabel, GsDetailsListValue },
    setup: () => ({ args }),
    template: `
      <GsDetailsList v-bind="args">
        <GsDetailsListLabel>Key</GsDetailsListLabel>
        <GsDetailsListValue>Value</GsDetailsListValue>

        <GsDetailsListLabel>Ships</GsDetailsListLabel>
        <GsDetailsListValue>Millennium Falcon</GsDetailsListValue>
        <GsDetailsListValue>USS Enterprise NCC-1701</GsDetailsListValue>
        <GsDetailsListValue>Serenity</GsDetailsListValue>

        <GsDetailsListLabel>Coordinates</GsDetailsListLabel>
        <GsDetailsListValue>
          <div>Great Pyramid of Giza: 29°58'44" N 31°08'02" E</div>
          <div>Machu Picchu: 13°09'47" S 72°32'41" W</div>
          <div>Nazca Lines: 14.7390° S, 75.1300° W</div>
          <div>Colosseum: 41°53'24" N 12°29'32" E</div>
          <div>Taj Mahal: 27°10'30" N 78°02'31" E</div>
        </GsDetailsListValue>
      </GsDetailsList>`,
  }),
}

/** `provideDetailsListDefaults()` sets the alignment of every details list below the component. */
export const Provider: Story = {
  render: (args) => ({
    components: { GsDetailsList, GsDetailsListLabel, GsDetailsListValue },
    setup: () => {
      provideDetailsListDefaults(() => ({ align: args.align }))
      return { args }
    },
    template: `
      <div class="flex flex-col gap-l">
        <GsDetailsList>
          <GsDetailsListLabel>Callsign</GsDetailsListLabel>
          <GsDetailsListValue>RAVEN 21</GsDetailsListValue>
          <GsDetailsListLabel>Status</GsDetailsListLabel>
          <GsDetailsListValue>Airborne</GsDetailsListValue>
        </GsDetailsList>
        <GsDetailsList>
          <GsDetailsListLabel>Altitude</GsDetailsListLabel>
          <GsDetailsListValue>32,000 ft</GsDetailsListValue>
          <GsDetailsListLabel>Heading</GsDetailsListLabel>
          <GsDetailsListValue>270°</GsDetailsListValue>
        </GsDetailsList>
      </div>`,
  }),
}
