import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PlaceholderIcon } from '@wingbrace/glideslope-icons'
import GsIcon from '../icon/GsIcon.vue'
import GsHero from './GsHero.vue'
import GsHeroSubtitle from './GsHeroSubtitle.vue'
import GsHeroTitle from './GsHeroTitle.vue'

const meta = {
  title: 'Components/Hero',
  component: GsHero,
  args: {
    compact: false,
  },
} satisfies Meta<typeof GsHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsHero, GsHeroTitle, GsHeroSubtitle, GsIcon, PlaceholderIcon },
    setup: () => ({ args }),
    template: `
      <div class="w-[480px]">
        <GsHero v-bind="args">
          <GsIcon><PlaceholderIcon /></GsIcon>
          <GsHeroTitle>{object.name}</GsHeroTitle>
          <GsHeroSubtitle>additional-metadata-01</GsHeroSubtitle>
          <GsHeroSubtitle>additional-metadata-002</GsHeroSubtitle>
        </GsHero>
      </div>`,
  }),
}
