import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsSkeleton from '../skeleton/GsSkeleton.vue'
import GsDeferredCollection from './GsDeferredCollection.vue'

const meta = {
  title: 'Components/DeferredCollection',
  component: GsDeferredCollection,
  parameters: {
    docs: {
      description: {
        component: `
          DeferredCollection defers rendering of large collections to prevent UI freezes.
          Building thousands of list or tree items blocks the main thread before anything is shown.
          This component defers the collection render by a few animation frames, allowing a
          fallback to display first.
        `,
      },
    },
  },
} satisfies Meta<typeof GsDeferredCollection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { GsButton, GsDeferredCollection, GsSkeleton },
    setup: () => {
      const key = ref(0)
      const itemCount = 100
      return { key, itemCount }
    },
    template: `
      <div class="flex flex-col gap-s">
        <GsButton size="small" @click="key++">Reset to see skeleton</GsButton>
        <GsDeferredCollection :key="key" :defer-frames="15">
          <div class="flex h-300 w-300 flex-col overflow-y-scroll">
            <div
              v-for="i in itemCount"
              :key="i"
              class="mb-xs flex min-h-30 items-center rounded-small bg-interactive-disabled px-s fg-primary-bold"
            >
              Item {{ i }}
            </div>
          </div>
          <template #fallback>
            <div class="flex h-300 w-300 flex-col gap-xs overflow-y-scroll">
              <GsSkeleton v-for="i in 10" :key="i" class="h-32" />
            </div>
          </template>
        </GsDeferredCollection>
      </div>`,
  }),
}
