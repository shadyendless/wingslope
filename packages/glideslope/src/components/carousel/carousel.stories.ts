import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { CAROUSEL_ITEMS, MIXED_CAROUSEL_ITEMS } from './__fixtures__'
import GsCarousel from './GsCarousel.vue'
import GsCarouselGallery from './GsCarouselGallery.vue'
import GsCarouselNext from './GsCarouselNext.vue'
import GsCarouselPosition from './GsCarouselPosition.vue'
import GsCarouselPrevious from './GsCarouselPrevious.vue'
import GsCarouselSelect from './GsCarouselSelect.vue'
import GsCarouselViewer from './GsCarouselViewer.vue'

const components = {
  GsCarousel,
  GsCarouselGallery,
  GsCarouselNext,
  GsCarouselPosition,
  GsCarouselPrevious,
  GsCarouselSelect,
  GsCarouselViewer,
}

const meta = {
  title: 'Components/Carousel',
  args: {
    items: CAROUSEL_ITEMS,
  },
  component: GsCarousel,
} satisfies Meta<typeof GsCarousel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, currentPosition: ref(0) }),
    template: `
      <GsCarousel v-model="currentPosition" :items="args.items" class="max-w-600">
        <GsCarouselViewer />
        <div class="flex w-full flex-row justify-between gap-s">
          <GsCarouselPrevious />
          <GsCarouselGallery />
          <GsCarouselNext />
        </div>
      </GsCarousel>`,
  }),
}

export const WithSelect: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, currentPosition: ref(0) }),
    template: `
      <GsCarousel v-model="currentPosition" :items="args.items" class="max-w-600">
        <GsCarouselViewer />
        <div class="flex flex-row justify-between gap-s p-s">
          <div class="flex shrink-0 flex-row gap-s">
            <GsCarouselPrevious />
            <GsCarouselPosition />
            <GsCarouselNext />
          </div>
          <GsCarouselSelect />
        </div>
      </GsCarousel>`,
  }),
}

export const MixedMedia: Story = {
  args: {
    items: MIXED_CAROUSEL_ITEMS,
  },
  render: (args) => ({
    components,
    setup: () => ({ args, currentPosition: ref(0) }),
    template: `
      <GsCarousel v-model="currentPosition" :items="args.items" class="max-w-600">
        <GsCarouselViewer />
        <div class="flex w-full flex-row justify-between gap-s">
          <GsCarouselPrevious />
          <GsCarouselGallery />
          <GsCarouselNext />
        </div>
      </GsCarousel>`,
  }),
}
