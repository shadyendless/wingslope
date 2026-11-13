import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import GsPagination from './GsPagination.vue'

const meta = {
  title: 'Components/Pagination',
  component: GsPagination,
  args: {
    total: 4,
  },
} satisfies Meta<typeof GsPagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsPagination },
    setup: () => ({ args }),
    template: '<GsPagination v-bind="args" />',
  }),
}

export const Example: Story = {
  render: (args) => ({
    components: { GsPagination },
    setup: () => ({ args, currentPage: ref(1) }),
    template: '<GsPagination v-bind="args" v-model="currentPage" />',
  }),
}
