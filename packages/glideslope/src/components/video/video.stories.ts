import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { action } from 'storybook/actions'
import demoPoster from './assets/demo-poster.png'
import demoVideo from './assets/demo.mp4'
import GsVideo from './GsVideo.vue'

/** The stories play a short generated clip bundled with them, so they work offline. */
const meta = {
  title: 'Components/Video',
  component: GsVideo,
  args: {
    src: demoVideo,
    disabled: false,
    muted: false,
    autoplay: false,
    loop: false,
    playbackRates: [1, 2, 3],
  },
  argTypes: {
    classes: {
      control: 'object',
      description: 'Classes for inner parts (video, mediaControls, timeRow, controlsRow)',
    },
    src: {
      control: 'text',
      description: 'Video source URL',
    },
    poster: {
      control: 'text',
      description: 'Poster image URL displayed before playback',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all video controls',
    },
    autoplay: {
      control: 'boolean',
      description: 'Autoplay (note: browsers may block this)',
    },
    loop: {
      control: 'boolean',
      description: 'Loop the video when it ends',
    },
    muted: {
      control: 'boolean',
      description: 'Start the video muted',
    },
    preload: {
      control: 'select',
      options: ['none', 'metadata', 'auto'],
      description: 'Preload behavior for the video element',
    },
    playbackRates: {
      control: 'object',
      description: 'Array of playback rate options (e.g., [0.5, 1, 1.5, 2])',
    },
    noHotkeys: {
      control: 'boolean',
      description: 'Disable all keyboard shortcuts',
    },
    noVolumePref: {
      control: 'boolean',
      description: 'Disable volume persistence to localStorage',
    },
    noMutedPref: {
      control: 'boolean',
      description: 'Disable muted state persistence to localStorage',
    },
  },
  render: (args) => ({
    components: { GsVideo },
    setup: () => ({ args }),
    template: '<GsVideo v-bind="args" class="w-[640px]" />',
  }),
} satisfies Meta<typeof GsVideo>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default video player with standard controls.
 * Includes play/pause, seek, volume, playback rate, and fullscreen controls.
 */
export const Default: Story = {}

/**
 * Video player with a poster image displayed before playback.
 * The poster is shown until the user plays the video.
 */
export const WithPoster: Story = {
  args: {
    poster: demoPoster,
  },
}

/**
 * Video player with event listeners.
 * Open the Storybook Actions panel to see the events being logged.
 */
export const Events: Story = {
  args: {
    onEnded: action('ended'),
    onTimeUpdate: action('timeUpdate'),
  },
}

/**
 * Video player with looping enabled.
 * The video will restart automatically when it ends.
 */
export const Looping: Story = {
  args: {
    loop: true,
  },
}

/**
 * Video player displaying an error state.
 * When video fails to load, an error message is shown and controls are disabled.
 */
export const ErrorState: Story = {
  args: {
    src: '/nonexistent-file.mp4',
    onError: action('error'),
  },
}

/**
 * Video player with keyboard shortcuts disabled.
 * Useful when embedding in forms or apps with custom hotkey systems.
 */
export const NoHotkeys: Story = {
  args: {
    noHotkeys: true,
  },
}
