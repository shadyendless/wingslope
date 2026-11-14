import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ChevronLeftIcon from '@wingbrace/glideslope-icons/chevron-left'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsViewStack from './GsViewStack.vue'
import GsViewStackTrigger from './GsViewStackTrigger.vue'
import GsViewStackView from './GsViewStackView.vue'

const ids = {
  stack: 'view-stack-story',
  a: 'view-stack-story-a',
  b: 'view-stack-story-b',
  c: 'view-stack-story-c',
}

const meta = {
  title: 'Components/ViewStack',
  component: GsViewStack,
  args: {
    id: ids.stack,
    defaultView: ids.a,
  },
  parameters: {
    docs: {
      subtitle: 'Stack-based navigation for managing multiple views',
    },
  },
} satisfies Meta<typeof GsViewStack>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: {
      GsViewStack,
      GsViewStackView,
      GsViewStackTrigger,
      GsButton,
      GsIcon,
      ChevronLeftIcon,
    },
    setup: () => ({ ids }),
    template: `
      <GsViewStack :id="ids.stack" :default-view="ids.a">
        <GsViewStackView :id="ids.a">
          <GsViewStackTrigger :for="ids.b">
            <GsButton size="small" variant="flat">Push View B</GsButton>
          </GsViewStackTrigger>
          <h1 class="h-oversized text-center fg-primary-bold">View A</h1>
        </GsViewStackView>
        <GsViewStackView :id="ids.b">
          <div class="flex">
            <GsViewStackTrigger for="back">
              <GsButton variant="icon" aria-label="Back">
                <GsIcon><ChevronLeftIcon /></GsIcon>
              </GsButton>
            </GsViewStackTrigger>
            <GsViewStackTrigger :for="ids.c">
              <GsButton size="small" variant="flat">Push View C</GsButton>
            </GsViewStackTrigger>
          </div>
          <h1 class="h-oversized text-center fg-primary-bold">View B</h1>
        </GsViewStackView>
        <GsViewStackView :id="ids.c">
          <GsViewStackTrigger for="back">
            <GsButton variant="icon" aria-label="Back">
              <GsIcon><ChevronLeftIcon /></GsIcon>
            </GsButton>
          </GsViewStackTrigger>
          <h1 class="h-oversized text-center fg-primary-bold">View C</h1>
        </GsViewStackView>
      </GsViewStack>
      <div class="flex gap-s">
        <GsViewStackTrigger :for="['clear:' + ids.stack, ids.a]">
          <GsButton variant="flat">Goto View A</GsButton>
        </GsViewStackTrigger>
        <GsViewStackTrigger :for="['clear:' + ids.stack, ids.b]">
          <GsButton variant="flat">Goto View B</GsButton>
        </GsViewStackTrigger>
        <GsViewStackTrigger :for="['clear:' + ids.stack, ids.c]">
          <GsButton variant="flat">Goto View C</GsButton>
        </GsViewStackTrigger>
      </div>`,
  }),
}
