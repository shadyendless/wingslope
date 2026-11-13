import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsSkeleton from './GsSkeleton.vue'

const meta = {
  title: 'Components/Skeleton',
  component: GsSkeleton,
  args: {
    variant: 'rectangle',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['circle', 'rectangle'],
    },
  },
  parameters: {
    docs: {
      subtitle: 'Placeholder content for loading states',
    },
  },
} satisfies Meta<typeof GsSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsSkeleton },
    setup: () => ({ args }),
    template: `
      <div class="w-[280px]">
        <GsSkeleton v-bind="args" />
      </div>`,
  }),
}

/** Skeletons are one line tall, so they take the size of the surrounding text, or a height class. */
export const Multiple: Story = {
  argTypes: {
    variant: {
      control: false,
    },
  },
  render: () => ({
    components: { GsSkeleton },
    template: `
      <div class="flex w-[280px] flex-col gap-l">
        <GsSkeleton class="h-oversized" />
        <div class="grid grid-cols-[auto_1fr] gap-m">
          <GsSkeleton variant="circle" />
          <GsSkeleton />
          <GsSkeleton variant="circle" />
          <GsSkeleton />
          <GsSkeleton variant="circle" />
          <GsSkeleton />
          <GsSkeleton variant="circle" />
          <GsSkeleton />
        </div>
        <div class="flex items-start gap-m">
          <div class="text-header-xl"><GsSkeleton variant="circle" /></div>
          <div class="flex grow flex-col gap-xs">
            <div class="text-header-m"><GsSkeleton /></div>
            <div class="text-body-s"><GsSkeleton /></div>
            <div class="w-2/3 text-body-s"><GsSkeleton /></div>
          </div>
        </div>
      </div>`,
  }),
}
