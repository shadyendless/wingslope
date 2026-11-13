import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, onBeforeUnmount } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsNoticeList from './GsNoticeList.vue'
import type { GsNoticeColor, GsNoticeInput, GsNoticeMetadata } from './types'
import { useNotices } from './use-notices'

// The notice queue is shared by every story on a docs page, so stories that queue several notices
// target lists of their own (with unique ids) and clear them when they unmount.
let instances = 0
const uniqueId = (name: string) => `${name}-${++instances}`

const colors: GsNoticeColor[] = ['normal', 'advisory', 'info', 'serious', 'critical']

/** Five notices for `target`, each showing its own id as the message. */
function generateNotices(target: string, extra: Partial<GsNoticeInput> = {}): GsNoticeInput[] {
  return Array.from({ length: 5 }, (_, index) => {
    const id = `${target}-notice-${index + 1}`
    return { id, target, message: id, ...extra }
  })
}

/** Clears a story's lists when it unmounts. */
function clearOnUnmount(...targets: string[]) {
  const { clear } = useNotices()
  onBeforeUnmount(() => targets.forEach((target) => clear(target)))
}

const meta = {
  title: 'Components/NoticeList',
  component: GsNoticeList,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    defaultColor: 'info',
    size: 'medium',
    hideClearAll: true,
    limit: 3,
  },
  argTypes: {
    defaultColor: {
      control: 'select',
      options: ['info', 'advisory', 'normal', 'serious', 'critical'],
    },
    placement: {
      control: 'select',
      options: [
        'top left',
        'top',
        'top right',
        'right',
        'bottom right',
        'bottom',
        'bottom left',
        'left',
      ],
    },
  },
} satisfies Meta<typeof GsNoticeList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsNoticeList, GsButton },
    setup: () => {
      const { queue, dequeue } = useNotices()
      const queued: string[] = []
      const create = () =>
        queued.push(
          queue({
            message:
              'This is a flexible snackbar that can be either a single or double line that will wrap accordingly when it gets too long for a single line.',
          }),
        )
      onBeforeUnmount(() => queued.forEach((id) => dequeue(id)))
      return { args, create }
    },
    template: `
      <div class="relative min-h-[480px] p-l">
        <div class="mb-l">
          <GsButton @click="create">Create Notice</GsButton>
        </div>
        <GsNoticeList v-bind="args" />
      </div>`,
  }),
}

export const DequeueSingle: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => ({
    components: { GsNoticeList, GsButton },
    setup: () => {
      const { notices, queue, dequeue } = useNotices()
      const list = uniqueId('dequeue-single')
      // Queued newest last, so the first notice is shown on top.
      generateNotices(list)
        .map((notice, index) => ({ ...notice, color: colors[index] }))
        .reverse()
        .forEach((notice) => queue(notice))
      clearOnUnmount(list)
      // Closing a notice also removes it from the queue, and with it its button.
      const queued = computed(() =>
        notices.value.filter((notice) => notice.target === list).toReversed(),
      )
      return { list, queued, dequeue }
    },
    template: `
      <div class="flex gap-l p-l">
        <div class="flex flex-1 flex-col gap-s fg-primary-bold">
          <GsButton v-for="notice in queued" :key="notice.id" @click="dequeue(notice.id)">
            Dequeue: {{ notice.id }}
          </GsButton>
        </div>
        <div class="flex-1">
          <GsNoticeList :id="list" hide-clear-all />
        </div>
      </div>`,
  }),
}

export const DequeueList: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => ({
    components: { GsNoticeList, GsButton },
    setup: () => {
      const { queue, dequeue } = useNotices()
      const a = uniqueId('list-a')
      const b = uniqueId('list-b')
      generateNotices(a).forEach((notice, index) => queue({ ...notice, color: colors[index] }))
      generateNotices(b).forEach((notice, index) => queue({ ...notice, color: colors[4 - index] }))
      clearOnUnmount(a, b)
      return { a, b, dequeue }
    },
    template: `
      <div class="flex gap-s p-l">
        <div class="flex flex-1 flex-col gap-s">
          <GsButton @click="dequeue({ target: a })">Dequeue List A</GsButton>
          <GsButton @click="dequeue({ target: b })">Dequeue List B</GsButton>
        </div>
        <div class="flex flex-1 flex-col gap-s">
          <div class="fg-primary-bold">List A</div>
          <GsNoticeList :id="a" label="List A notifications" hide-clear-all />
          <div class="fg-primary-bold">List B</div>
          <GsNoticeList :id="b" label="List B notifications" hide-clear-all />
        </div>
      </div>`,
  }),
}

/** `dequeue({ color })` without a `target` removes the notices of that color from every list. */
export const DequeueColor: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => ({
    components: { GsNoticeList, GsButton },
    setup: () => {
      const { queue, dequeue } = useNotices()
      const list = uniqueId('dequeue-color')
      generateNotices(list).forEach((notice, index) => queue({ ...notice, color: colors[index] }))
      clearOnUnmount(list)
      return { list, colors, dequeue }
    },
    template: `
      <div class="flex gap-s p-l">
        <div class="flex flex-1 flex-col gap-s">
          <GsButton v-for="color in colors" :key="color" @click="dequeue({ color })">
            Dequeue: {{ color }}
          </GsButton>
        </div>
        <div class="flex-1">
          <GsNoticeList :id="list" label="Colored notifications" :limit="5" hide-clear-all />
        </div>
      </div>`,
  }),
}

/** `dequeue({ metadata })` removes notices whose metadata deeply equals each given key. */
export const DequeueMetadata: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => ({
    components: { GsNoticeList, GsButton },
    setup: () => {
      const { queue, dequeue } = useNotices()
      const lists = ['a', 'b', 'c', 'd'].map((name) => uniqueId(`metadata-${name}`))
      const metadataA = { shape: 'circle' }
      const metadataB = { shape: 'square' }
      const metadataC = { shapes: ['circle', 'square'] }
      const metadataD = { shapes: { shape: 'square' } }
      const metadata: GsNoticeMetadata[] = [metadataA, metadataB, metadataC, metadataD]
      // Each list alternates between two kinds of metadata.
      const pairs = [
        [metadataA, metadataB],
        [metadataB, metadataA],
        [metadataC, metadataD],
        [metadataD, metadataC],
      ] as const
      lists.forEach((list, listIndex) => {
        const [even, odd] = pairs[listIndex]!
        generateNotices(list).forEach((notice, index) => {
          const data = index % 2 === 0 ? even : odd
          queue({ ...notice, color: colors[index], metadata: data, message: JSON.stringify(data) })
        })
      })
      clearOnUnmount(...lists)
      return { lists, metadata, dequeue }
    },
    template: `
      <div class="flex gap-s p-l">
        <div class="flex flex-1 flex-col gap-s">
          <GsButton
            v-for="data in metadata"
            :key="JSON.stringify(data)"
            @click="dequeue({ metadata: data })"
          >
            Dequeue: {{ JSON.stringify(data) }}
          </GsButton>
        </div>
        <div class="flex flex-1 flex-col gap-s">
          <GsNoticeList
            v-for="(list, index) in lists"
            :id="list"
            :key="list"
            :label="'Notices ' + 'ABCD'[index]"
            hide-clear-all
          />
        </div>
      </div>`,
  }),
}

/** A notice must match every criterion given: here a target, a color and metadata. */
export const DequeueCombination: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => ({
    components: { GsNoticeList, GsButton },
    setup: () => {
      const { queue, dequeue } = useNotices()
      const a = uniqueId('combination-a')
      const b = uniqueId('combination-b')
      const circle = { shape: 'circle' }
      const square = { shape: 'square' }
      generateNotices(a).forEach((notice, index) => {
        const metadata = index % 2 === 0 ? circle : square
        const color = index % 2 === 0 ? 'info' : 'serious'
        queue({ ...notice, metadata, color, message: JSON.stringify(metadata) })
      })
      generateNotices(b).forEach((notice, index) => {
        const metadata = index % 2 === 0 ? square : circle
        const color = index % 2 === 0 ? 'info' : 'serious'
        queue({ ...notice, metadata, color, message: JSON.stringify(metadata) })
      })
      clearOnUnmount(a, b)
      const dequeueSeriousSquares = () => dequeue({ target: a, color: 'serious', metadata: square })
      return { a, b, dequeueSeriousSquares }
    },
    template: `
      <div class="flex p-l">
        <div class="flex flex-1 flex-col gap-s">
          <GsButton @click="dequeueSeriousSquares">Dequeue: Serious squares from List A</GsButton>
        </div>
        <div class="flex h-full flex-1 flex-col justify-between gap-s">
          <div class="fg-primary-bold">List A</div>
          <GsNoticeList :id="a" label="List A notifications" hide-clear-all />
          <div class="fg-primary-bold">List B</div>
          <GsNoticeList :id="b" label="List B notifications" hide-clear-all />
        </div>
      </div>`,
  }),
}
