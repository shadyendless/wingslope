import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { action } from 'storybook/actions'
import demoAudio from './assets/demo.mp3'
import GsAudio from './GsAudio.vue'

/** The stories play a short generated track bundled with them, so they work offline. */
const meta = {
  title: 'Components/Audio',
  component: GsAudio,
  args: {
    src: demoAudio,
    disabled: false,
    muted: false,
    autoplay: false,
    loop: false,
    playbackRates: [1, 2, 3],
  },
  argTypes: {
    classes: {
      control: 'object',
      description: 'Classes for inner parts (title, mediaControls, timeRow, controlsRow)',
    },
    src: {
      control: 'text',
      description: 'Audio source URL',
    },
    title: {
      control: 'text',
      description: 'Title to display above the controls',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all audio controls',
    },
    autoplay: {
      control: 'boolean',
      description: 'Autoplay (note: browsers may block this)',
    },
    loop: {
      control: 'boolean',
      description: 'Loop the audio when it ends',
    },
    muted: {
      control: 'boolean',
      description: 'Start the audio muted',
    },
    preload: {
      control: 'select',
      options: ['none', 'metadata', 'auto'],
      description: 'Preload behavior for the audio element',
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
    components: { GsAudio },
    setup: () => ({ args }),
    template: '<GsAudio v-bind="args" class="w-[400px]" />',
  }),
} satisfies Meta<typeof GsAudio>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default audio player with standard controls.
 * Includes play/pause, seek, volume, and playback rate controls.
 */
export const Default: Story = {}

/**
 * Audio player with a title displayed above the controls.
 * Useful for showing the filename or track name.
 */
export const WithTitle: Story = {
  args: {
    title: 'Sample Audio Track.mp3',
  },
}

/**
 * Audio player with event listeners.
 * Open the Storybook Actions panel to see the events being logged.
 */
export const Events: Story = {
  args: {
    title: 'Audio with Event Callbacks',
    onPlay: action('play'),
    onPause: action('pause'),
    onEnded: action('ended'),
    onTimeUpdate: action('timeUpdate'),
    onLoadedMetadata: action('loadedMetadata'),
  },
}

/**
 * Audio player with looping enabled.
 * The audio will restart automatically when it ends.
 */
export const Looping: Story = {
  args: {
    title: 'Looping Audio',
    loop: true,
  },
}

/**
 * Audio player displaying an error state.
 * When audio fails to load, an error message is shown and controls are disabled.
 */
export const ErrorState: Story = {
  args: {
    title: 'audioFileName.flac',
    src: '/nonexistent-file.mp3',
    onError: action('error'),
  },
}

/**
 * Audio player with keyboard shortcuts disabled.
 * Useful when embedding in forms or apps with custom hotkey systems.
 */
export const NoHotkeys: Story = {
  args: {
    title: 'No Keyboard Shortcuts',
    noHotkeys: true,
  },
}
