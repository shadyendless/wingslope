import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { onBeforeUnmount, watch } from 'vue'
import GsNotice from './GsNotice.vue'
import GsNoticeList from './GsNoticeList.vue'
import type { GsNoticeInput, GsNoticeProps } from './types'
import { useNotices } from './use-notices'

// A notice is a Reka toast and needs a viewport, which `GsNoticeList` provides, so these stories
// queue their notices into an in-place list. Each story renders its own targeted list, so stories
// on the same docs page don't show each other's notices.
let instances = 0

/** Queues notices built from the story args for a list of its own, and keeps them in sync. */
function useStoryNotices(args: GsNoticeProps, build: (args: GsNoticeProps) => GsNoticeProps[]) {
  const { queue, clear } = useNotices()
  const target = `notice-story-${++instances}`
  const toInput = (notice: GsNoticeProps, id: string): GsNoticeInput => ({
    id,
    target,
    message: notice.message,
    color: notice.color,
    primary: notice.primary,
    secondary: notice.secondary,
    timeout: notice.timeout,
    showClose: notice.showClose,
    hideIcon: notice.hideIcon,
    closeOnAction: notice.closeOnAction,
  })
  watch(
    () => build({ ...args }),
    (notices) =>
      // Lists show the newest notice first, so queue the last one first.
      notices
        .map((notice, index) => toInput(notice, `${target}-${index}`))
        .reverse()
        .forEach((notice) => queue(notice)),
    { immediate: true },
  )
  onBeforeUnmount(() => clear(target))
  return target
}

const meta = {
  title: 'Components/Notice',
  component: GsNotice,
  args: {
    color: 'info',
    message:
      'This is a flexible snackbar that can be either a single or double line that will wrap accordingly when it gets too long for a single line.',
    size: 'medium',
    showClose: true,
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['info', 'advisory', 'normal', 'serious', 'critical'],
    },
  },
  render: (args) => ({
    components: { GsNoticeList },
    setup: () => ({ args, target: useStoryNotices(args, (notice) => [notice]) }),
    template: `<GsNoticeList :id="target" :size="args.size" label="Example notice" hide-clear-all />`,
  }),
} satisfies Meta<typeof GsNotice>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ButtonEvents: Story = {
  render: (args) => ({
    components: { GsNoticeList },
    setup: () => ({
      args,
      // Asserted for `vp check`, whose TypeScript 7 pass sees untyped story args (see src/env.d.ts).
      target: useStoryNotices(args as GsNoticeProps, (notice) => [
        notice,
        {
          ...notice,
          showClose: false,
          primary: { label: 'Primary' },
          secondary: { label: 'Secondary' },
        },
      ]),
    }),
    template: `<GsNoticeList :id="target" :size="args.size" label="Example notices" hide-clear-all />`,
  }),
}
