import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsSkeleton from './GsSkeleton.vue'

const meta = {
  title: 'Components/Skeleton',
  component: GsSkeleton,
  args: { variant: 'rectangle' },
  argTypes: { variant: { control: 'inline-radio', options: ['rectangle', 'circle'] } },
  render: (args) => ({
    components: { GsSkeleton },
    setup: () => ({ args }),
    template: '<div style="width: 240px" class="text-body-l"><GsSkeleton v-bind="args" /></div>',
  }),
} satisfies Meta<typeof GsSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Skeletons are one line tall, so they take the size of the surrounding text. */
export const LoadingCard: Story = {
  render: () => ({
    components: { GsSkeleton },
    template: `
      <div style="width: 280px" class="flex gap-m items-start">
        <div class="text-header-xl"><GsSkeleton variant="circle" /></div>
        <div class="flex flex-col gap-xs grow">
          <div class="text-header-m"><GsSkeleton /></div>
          <div class="text-body-s"><GsSkeleton /></div>
          <div class="text-body-s w-2/3"><GsSkeleton /></div>
        </div>
      </div>`,
  }),
}
