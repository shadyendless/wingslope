import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { RadarIcon } from '@wingbrace/glideslope-icons'
import GsIcon from '../icon/GsIcon.vue'
import GsHero from './GsHero.vue'
import GsHeroSubtitle from './GsHeroSubtitle.vue'
import GsHeroTitle from './GsHeroTitle.vue'

const meta = {
  title: 'Components/Hero',
  component: GsHero,
  args: { compact: false },
  render: (args) => ({
    components: { GsHero, GsHeroTitle, GsHeroSubtitle, GsIcon, RadarIcon },
    setup: () => ({ args }),
    template: `
      <div style="width: 360px">
        <GsHero v-bind="args">
          <GsIcon><RadarIcon /></GsIcon>
          <GsHeroTitle>No tracks selected</GsHeroTitle>
          <GsHeroSubtitle>Select a track on the map to see its details.</GsHeroSubtitle>
        </GsHero>
      </div>`,
  }),
} satisfies Meta<typeof GsHero>

export default meta
type Story = StoryObj<typeof meta>

export const Stack: Story = {}
export const Compact: Story = { args: { compact: true } }
