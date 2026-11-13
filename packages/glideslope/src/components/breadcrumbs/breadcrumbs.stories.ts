import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsBreadcrumbItem from './GsBreadcrumbItem.vue'
import GsBreadcrumbs from './GsBreadcrumbs.vue'

const meta = {
  title: 'Components/Breadcrumbs',
  component: GsBreadcrumbs,
} satisfies Meta<typeof GsBreadcrumbs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsBreadcrumbs, GsBreadcrumbItem },
    setup: () => ({ args }),
    template: `
      <GsBreadcrumbs v-bind="args">
        <GsBreadcrumbItem href="#/">Root</GsBreadcrumbItem>
        <GsBreadcrumbItem href="#/home">Child</GsBreadcrumbItem>
        <GsBreadcrumbItem current>Child</GsBreadcrumbItem>
      </GsBreadcrumbs>`,
  }),
}

/** Glideslope extra: with `as-child`, an item renders your own link component, such as a `RouterLink`. */
export const CustomLinks: Story = {
  render: (args) => ({
    components: { GsBreadcrumbs, GsBreadcrumbItem },
    setup: () => ({ args }),
    template: `
      <GsBreadcrumbs v-bind="args">
        <GsBreadcrumbItem as-child><a href="#/" data-router-link>Home</a></GsBreadcrumbItem>
        <GsBreadcrumbItem current>Settings</GsBreadcrumbItem>
      </GsBreadcrumbs>`,
  }),
}
