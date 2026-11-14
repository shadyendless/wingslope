import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UndoIcon from '@wingbrace/glideslope-icons/undo'
import demoAudio from '../audio/assets/demo.mp3'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsMediaController from './GsMediaController.vue'
import GsMediaControls from './GsMediaControls.vue'
import GsMuteButton from './GsMuteButton.vue'
import GsPlayButton from './GsPlayButton.vue'
import GsPlaybackRateButton from './GsPlaybackRateButton.vue'
import GsSeekButton from './GsSeekButton.vue'
import GsTimeDisplay from './GsTimeDisplay.vue'
import GsTimeRange from './GsTimeRange.vue'
import GsVolumeSlider from './GsVolumeSlider.vue'
import { MediaActionTypes, useMediaDispatch, useMediaSelector } from './use-media'

const controls = {
  GsMediaControls,
  GsMuteButton,
  GsPlayButton,
  GsPlaybackRateButton,
  GsSeekButton,
  GsTimeDisplay,
  GsTimeRange,
  GsVolumeSlider,
}

/**
 * Wraps each story in a `GsMediaController` with a short generated track, which the controls
 * need to work. `bg-transparent` drops media-chrome's default black controller background.
 */
const meta = {
  title: 'Components/MediaControls',
  component: GsPlayButton,
  decorators: [
    () => ({
      components: { GsMediaController },
      setup: () => ({ src: demoAudio }),
      template: `
        <GsMediaController audio class="bg-transparent">
          <audio slot="media" :src="src" preload="metadata"></audio>
          <story />
        </GsMediaController>`,
    }),
  ],
  parameters: {
    controls: {
      exclude: [/^aria-/, 'class', 'ref', 'role'],
    },
  },
} satisfies Meta<typeof GsPlayButton>

export default meta
type Story = StoryObj<typeof meta>

/**
 * GsMediaControls: a container for composing media controls. This example shows every control in
 * a two-row layout.
 */
export const MediaControlsComposed: StoryObj<typeof GsMediaControls> = {
  name: 'MediaControls',
  args: {
    disabled: false,
  },
  render: (args) => ({
    components: controls,
    setup: () => ({ args }),
    template: `
      <div class="w-[400px] rounded-medium bg-surface-raised p-m">
        <GsMediaControls v-bind="args" class="flex-col gap-s">
          <div class="flex w-full items-center gap-s">
            <GsTimeDisplay mode="current" />
            <GsTimeRange />
            <GsTimeDisplay mode="duration" />
          </div>
          <div class="flex w-full items-center">
            <div class="flex flex-1 items-center gap-s">
              <GsMuteButton />
              <GsVolumeSlider />
            </div>
            <div class="flex items-center gap-xs">
              <GsSeekButton direction="backward" />
              <GsPlayButton />
              <GsSeekButton direction="forward" />
            </div>
            <div class="flex flex-1 justify-end">
              <GsPlaybackRateButton :rates="[0.5, 1, 1.5, 2]" />
            </div>
          </div>
        </GsMediaControls>
      </div>`,
  }),
}

/** GsPlayButton: plays and pauses. It shows a play icon while paused and a pause icon while playing. */
export const PlayButtonDefault: Story = {
  name: 'PlayButton',
  args: {
    disabled: false,
  },
  render: (args) => ({
    components: { GsPlayButton },
    setup: () => ({ args }),
    template: '<GsPlayButton v-bind="args" />',
  }),
}

/** GsMuteButton: mutes and unmutes. It shows a sound icon while audible and a muted icon otherwise. */
export const MuteButtonDefault: StoryObj<typeof GsMuteButton> = {
  name: 'MuteButton',
  args: {
    disabled: false,
  },
  render: (args) => ({
    components: { GsMuteButton },
    setup: () => ({ args }),
    template: '<GsMuteButton v-bind="args" />',
  }),
}

/** GsSeekButton: seeks forward or backward, by 10 seconds unless `seekOffset` says otherwise. */
export const SeekButtonDefault: StoryObj<typeof GsSeekButton> = {
  name: 'SeekButton',
  args: {
    direction: 'forward',
    seekOffset: 10,
    disabled: false,
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['forward', 'backward'],
    },
  },
  render: (args) => ({
    components: { GsSeekButton },
    setup: () => ({ args }),
    template: '<GsSeekButton v-bind="args" />',
  }),
}

/** GsVolumeSlider: sets the volume. */
export const VolumeSliderDefault: StoryObj<typeof GsVolumeSlider> = {
  name: 'VolumeSlider',
  args: {
    showLabel: false,
    disabled: false,
  },
  render: (args) => ({
    components: { GsVolumeSlider },
    setup: () => ({ args }),
    template: '<div class="w-[150px]"><GsVolumeSlider v-bind="args" /></div>',
  }),
}

/** GsTimeDisplay: shows the playback time. */
export const TimeDisplayDefault: StoryObj<typeof GsTimeDisplay> = {
  name: 'TimeDisplay',
  args: {
    mode: 'current',
    placeholder: 'hh:mm:ss',
    disabled: false,
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['current', 'remaining', 'duration'],
    },
  },
  render: (args) => ({
    components: { GsTimeDisplay },
    setup: () => ({ args }),
    template: '<GsTimeDisplay v-bind="args" />',
  }),
}

/** GsPlaybackRateButton: cycles through playback speeds (1x, 2x and 3x by default). */
export const PlaybackRateButtonDefault: StoryObj<typeof GsPlaybackRateButton> = {
  name: 'PlaybackRateButton',
  args: {
    rates: [1, 1.5, 2],
    disabled: false,
  },
  render: (args) => ({
    components: { GsPlaybackRateButton },
    setup: () => ({ args }),
    template: '<GsPlaybackRateButton v-bind="args" />',
  }),
}

/**
 * Glideslope only: a control of your own, built with `useMediaSelector` and `useMediaDispatch`.
 * `@keydown.space.stop` keeps the controller's Space shortcut from taking Space away from the
 * button.
 */
export const CustomControl: Story = {
  render: () => ({
    components: { GsButton, GsIcon, GsPlayButton, GsTimeDisplay, UndoIcon },
    setup() {
      const dispatch = useMediaDispatch()
      const atStart = useMediaSelector((state) => !state.mediaCurrentTime)
      const restart = () => dispatch({ type: MediaActionTypes.MEDIA_SEEK_REQUEST, detail: 0 })
      return { atStart, restart }
    },
    template: `
      <div class="flex items-center gap-xs">
        <GsButton
          variant="icon"
          aria-label="Restart"
          :disabled="atStart"
          @click="restart"
          @keydown.space.stop
        >
          <GsIcon><UndoIcon /></GsIcon>
        </GsButton>
        <GsPlayButton />
        <GsTimeDisplay />
      </div>`,
  }),
}
