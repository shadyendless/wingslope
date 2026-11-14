import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { MediaUIEvents } from 'media-chrome/dist/constants.js'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, shallowRef, type ShallowRef, type VNodeChild } from 'vue'
import { provideMediaControlsDisabled, provideMediaStore } from './context'
import GsFullscreenButton from './GsFullscreenButton.vue'
import GsMediaController from './GsMediaController.vue'
import GsMediaControls from './GsMediaControls.vue'
import GsMuteButton from './GsMuteButton.vue'
import GsPlayButton from './GsPlayButton.vue'
import GsPlaybackRateButton from './GsPlaybackRateButton.vue'
import GsSeekButton from './GsSeekButton.vue'
import GsTimeDisplay from './GsTimeDisplay.vue'
import GsTimeRange from './GsTimeRange.vue'
import GsVolumeSlider from './GsVolumeSlider.vue'
import type { GsMediaState, GsMediaStore } from './types'
import { useMediaDispatch, useMediaSelector } from './use-media'

/** A media store whose state the test sets, recording what the controls dispatch. */
function createStore(initial: GsMediaState = {}) {
  let state = initial
  const listeners = new Set<(state: GsMediaState) => void>()
  const dispatch = vi.fn()
  const store: GsMediaStore = {
    dispatch,
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener)
      listener(state)
      return () => listeners.delete(listener)
    },
  }
  const set = async (next: GsMediaState) => {
    state = { ...state, ...next }
    listeners.forEach((listener) => listener(state))
    await nextTick()
  }
  return { store, dispatch, set, listeners }
}

/** Provides a store (and optionally a disabled container) the way `GsMediaController` does. */
const StoreHost = defineComponent({
  props: {
    store: { type: Object as () => ShallowRef<GsMediaStore | undefined>, required: true },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    provideMediaStore(props.store)
    provideMediaControlsDisabled(() => props.disabled)
    return () => slots.default?.()
  },
})

function renderInStore(
  content: () => VNodeChild,
  state: GsMediaState = {},
  options: { disabled?: boolean } = {},
) {
  const fake = createStore(state)
  const storeRef = shallowRef<GsMediaStore | undefined>(fake.store)
  const utils = render(() =>
    h(StoreHost, { store: storeRef, disabled: options.disabled ?? false }, content),
  )
  return { ...utils, ...fake, storeRef }
}

/** A loaded track: 120 s long, 30 s in. */
const loaded: GsMediaState = { mediaDuration: 120, mediaCurrentTime: 30 }

describe('GsMediaControls', () => {
  it('renders its controls in a container that takes classes and attributes', () => {
    renderInStore(() =>
      h(GsMediaControls, { class: 'mine', 'data-testid': 'controls' }, () => [
        h(GsPlayButton),
        h(GsMuteButton),
      ]),
    )
    const controls = screen.getByTestId('controls')
    expect(controls).toHaveClass('group/media-controls', 'mediaControls', 'mine')
    expect(controls).not.toHaveAttribute('data-disabled')
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mute' })).toBeInTheDocument()
  })

  it('disables every control inside', () => {
    renderInStore(
      () =>
        h(GsMediaControls, { disabled: true, 'data-testid': 'controls' }, () => [
          h(GsPlayButton),
          h(GsMuteButton),
          h(GsSeekButton, { direction: 'forward' }),
          h(GsPlaybackRateButton),
          h(GsFullscreenButton),
          h(GsTimeRange),
          h(GsVolumeSlider),
          h(GsTimeDisplay, { 'data-testid': 'time' }),
        ]),
      loaded,
    )
    expect(screen.getByTestId('controls')).toHaveAttribute('data-disabled')
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled()
    expect(document.querySelector('media-time-range')).toHaveAttribute('disabled')
    expect(document.querySelector('media-volume-range')).toHaveAttribute('disabled')
    expect(screen.getByTestId('time')).toHaveAttribute('data-disabled')
  })

  it("keeps an outer container's disabled state: a nested container can't re-enable controls", () => {
    renderInStore(() => h(GsMediaControls, null, () => h(GsPlayButton)), {}, { disabled: true })
    expect(screen.getByRole('button', { name: 'Play' })).toBeDisabled()
  })

  it('throws outside a GsMediaController', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => render(GsMediaControls)).toThrow(/inside a GsMediaController/)
    expect(() => render(GsPlayButton)).toThrow(/inside a GsMediaController/)
  })
})

describe('GsPlayButton', () => {
  it('plays while paused and pauses while playing, with a matching label', async () => {
    const { dispatch, set } = renderInStore(() => h(GsPlayButton), { mediaPaused: true })
    await userEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(dispatch).toHaveBeenLastCalledWith({ type: MediaUIEvents.MEDIA_PLAY_REQUEST })

    await set({ mediaPaused: false })
    await userEvent.click(screen.getByRole('button', { name: 'Pause' }))
    expect(dispatch).toHaveBeenLastCalledWith({ type: MediaUIEvents.MEDIA_PAUSE_REQUEST })
  })

  it('treats media with no state yet as paused', () => {
    renderInStore(() => h(GsPlayButton))
    expect(screen.getByRole('button', { name: 'Play' })).toBeEnabled()
  })

  it('is an icon button, and takes classes and listeners', async () => {
    const onClick = vi.fn()
    renderInStore(() => h(GsPlayButton, { class: 'mine', onClick }))
    const button = screen.getByRole('button', { name: 'Play' })
    expect(button).toHaveClass('button', 'icon', 'mine')
    expect(button).toHaveAttribute('data-size', 'medium')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does nothing while disabled, by prop or by its container', async () => {
    const { dispatch } = renderInStore(() => [
      h(GsPlayButton, { disabled: true }),
      h(GsMediaControls, { disabled: true }, () => h(GsPlayButton, { disabled: false })),
    ])
    for (const button of screen.getAllByRole('button', { name: 'Play' })) {
      expect(button).toBeDisabled()
      await userEvent.click(button)
    }
    expect(dispatch).not.toHaveBeenCalled()
  })
})

describe('GsMuteButton', () => {
  it('mutes and unmutes, labelled by whether sound plays', async () => {
    const { dispatch, set } = renderInStore(() => h(GsMuteButton), {
      mediaMuted: false,
      mediaVolumeLevel: 'high',
    })
    await userEvent.click(screen.getByRole('button', { name: 'Mute' }))
    expect(dispatch).toHaveBeenLastCalledWith({ type: MediaUIEvents.MEDIA_MUTE_REQUEST })

    await set({ mediaMuted: true, mediaVolumeLevel: 'off' })
    await userEvent.click(screen.getByRole('button', { name: 'Unmute' }))
    expect(dispatch).toHaveBeenLastCalledWith({ type: MediaUIEvents.MEDIA_UNMUTE_REQUEST })
  })

  it('shows as muted at zero volume, and still mutes when pressed', async () => {
    const { dispatch } = renderInStore(() => h(GsMuteButton), {
      mediaMuted: false,
      mediaVolumeLevel: 'off',
    })
    await userEvent.click(screen.getByRole('button', { name: 'Unmute' }))
    expect(dispatch).toHaveBeenLastCalledWith({ type: MediaUIEvents.MEDIA_MUTE_REQUEST })
  })

  it('does nothing while disabled', async () => {
    const { dispatch } = renderInStore(() => h(GsMuteButton, { disabled: true }))
    await userEvent.click(screen.getByRole('button', { name: 'Mute' }))
    expect(dispatch).not.toHaveBeenCalled()
  })
})

describe('GsSeekButton', () => {
  it('seeks by 10 seconds in either direction', async () => {
    const { dispatch } = renderInStore(
      () => [h(GsSeekButton, { direction: 'forward' }), h(GsSeekButton, { direction: 'backward' })],
      loaded,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Seek forward 10 seconds' }))
    expect(dispatch).toHaveBeenLastCalledWith({
      type: MediaUIEvents.MEDIA_SEEK_REQUEST,
      detail: 40,
    })
    await userEvent.click(screen.getByRole('button', { name: 'Seek backward 10 seconds' }))
    expect(dispatch).toHaveBeenLastCalledWith({
      type: MediaUIEvents.MEDIA_SEEK_REQUEST,
      detail: 20,
    })
  })

  it('seeks by a custom offset', async () => {
    const { dispatch } = renderInStore(
      () => h(GsSeekButton, { direction: 'forward', seekOffset: 30 }),
      loaded,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Seek forward 30 seconds' }))
    expect(dispatch).toHaveBeenLastCalledWith({
      type: MediaUIEvents.MEDIA_SEEK_REQUEST,
      detail: 60,
    })
  })

  it('stops at the start and the end', async () => {
    const { dispatch, set } = renderInStore(
      () => [h(GsSeekButton, { direction: 'forward' }), h(GsSeekButton, { direction: 'backward' })],
      { mediaDuration: 120, mediaCurrentTime: 5 },
    )
    await userEvent.click(screen.getByRole('button', { name: /backward/ }))
    expect(dispatch).toHaveBeenLastCalledWith({
      type: MediaUIEvents.MEDIA_SEEK_REQUEST,
      detail: 0,
    })
    await set({ mediaCurrentTime: 115 })
    await userEvent.click(screen.getByRole('button', { name: /forward/ }))
    expect(dispatch).toHaveBeenLastCalledWith({
      type: MediaUIEvents.MEDIA_SEEK_REQUEST,
      detail: 120,
    })
  })

  it('is disabled until the duration and position are known', async () => {
    const { dispatch, set } = renderInStore(() => h(GsSeekButton, { direction: 'forward' }), {
      mediaDuration: Number.NaN,
      mediaCurrentTime: 0,
    })
    const button = screen.getByRole('button', { name: 'Seek forward 10 seconds' })
    expect(button).toBeDisabled()
    await set({ mediaDuration: 0 })
    expect(button).toBeDisabled()
    await set({ mediaDuration: 120, mediaCurrentTime: undefined })
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(dispatch).not.toHaveBeenCalled()

    await set({ mediaCurrentTime: 0 })
    expect(button).toBeEnabled()
  })

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -5, 0])(
    'falls back to 10 seconds, with a warning, for a seekOffset of %s',
    (seekOffset) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      renderInStore(() => h(GsSeekButton, { direction: 'forward', seekOffset }), loaded)
      expect(screen.getByRole('button', { name: 'Seek forward 10 seconds' })).toBeInTheDocument()
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('Invalid seekOffset'))
    },
  )

  it('is disabled by its prop or its container even when loaded', () => {
    renderInStore(() => h(GsSeekButton, { direction: 'forward', disabled: true }), loaded)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

describe('GsPlaybackRateButton', () => {
  it('shows the rate and moves to the next one, wrapping around', async () => {
    const { dispatch, set } = renderInStore(() => h(GsPlaybackRateButton), {
      mediaPlaybackRate: 1,
    })
    const button = screen.getByRole('button', { name: 'Playback rate 1x' })
    expect(button).toHaveTextContent('1x')
    await userEvent.click(button)
    expect(dispatch).toHaveBeenLastCalledWith({
      type: MediaUIEvents.MEDIA_PLAYBACK_RATE_REQUEST,
      detail: 2,
    })

    await set({ mediaPlaybackRate: 3 })
    expect(button).toHaveAccessibleName('Playback rate 3x')
    await userEvent.click(button)
    expect(dispatch).toHaveBeenLastCalledWith({
      type: MediaUIEvents.MEDIA_PLAYBACK_RATE_REQUEST,
      detail: 1,
    })
  })

  it('cycles through custom rates, from the first when the rate is not among them', async () => {
    const { dispatch } = renderInStore(() => h(GsPlaybackRateButton, { rates: [0.5, 1, 1.5] }), {
      mediaPlaybackRate: 2,
    })
    await userEvent.click(screen.getByRole('button', { name: 'Playback rate 2x' }))
    expect(dispatch).toHaveBeenLastCalledWith({
      type: MediaUIEvents.MEDIA_PLAYBACK_RATE_REQUEST,
      detail: 0.5,
    })
  })

  it('leaves out invalid rates', async () => {
    const { dispatch } = renderInStore(
      () => h(GsPlaybackRateButton, { rates: [1, Number.NaN, Number.POSITIVE_INFINITY, -1, 0, 4] }),
      { mediaPlaybackRate: 1 },
    )
    await userEvent.click(screen.getByRole('button'))
    expect(dispatch).toHaveBeenLastCalledWith({
      type: MediaUIEvents.MEDIA_PLAYBACK_RATE_REQUEST,
      detail: 4,
    })
  })

  it.each([[[]], [[Number.NaN, -1, 0]]])('uses the default rates for %j', async (rates) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { dispatch } = renderInStore(() => h(GsPlaybackRateButton, { rates }), {
      mediaPlaybackRate: 2,
    })
    await userEvent.click(screen.getByRole('button'))
    expect(dispatch).toHaveBeenLastCalledWith({
      type: MediaUIEvents.MEDIA_PLAYBACK_RATE_REQUEST,
      detail: 3,
    })
    // Only rates that were all invalid are worth a warning.
    expect(warn).toHaveBeenCalledTimes(rates.length ? 1 : 0)
  })

  it('shows the first rate when the media reports an invalid one', () => {
    renderInStore(() => h(GsPlaybackRateButton, { rates: [1.5, 2] }), {
      mediaPlaybackRate: Number.NaN,
    })
    expect(screen.getByRole('button')).toHaveAccessibleName('Playback rate 1.5x')
  })

  it('does nothing while disabled', async () => {
    const { dispatch } = renderInStore(() => h(GsPlaybackRateButton, { disabled: true }))
    await userEvent.click(screen.getByRole('button'))
    expect(dispatch).not.toHaveBeenCalled()
  })
})

describe('GsFullscreenButton', () => {
  it('enters and exits fullscreen, with a matching label', async () => {
    const { dispatch, set } = renderInStore(() => h(GsFullscreenButton))
    await userEvent.click(screen.getByRole('button', { name: 'Enter fullscreen' }))
    expect(dispatch).toHaveBeenLastCalledWith({
      type: MediaUIEvents.MEDIA_ENTER_FULLSCREEN_REQUEST,
    })

    await set({ mediaIsFullscreen: true })
    await userEvent.click(screen.getByRole('button', { name: 'Exit fullscreen' }))
    expect(dispatch).toHaveBeenLastCalledWith({
      type: MediaUIEvents.MEDIA_EXIT_FULLSCREEN_REQUEST,
    })
  })

  it('does nothing while disabled', async () => {
    const { dispatch } = renderInStore(() => h(GsFullscreenButton), {}, { disabled: true })
    await userEvent.click(screen.getByRole('button'))
    expect(dispatch).not.toHaveBeenCalled()
  })
})

describe('GsTimeDisplay', () => {
  it('shows the placeholder until the duration is known', async () => {
    const { set } = renderInStore(() => h(GsTimeDisplay, { 'data-testid': 'time' }), {
      mediaDuration: Number.NaN,
    })
    expect(screen.getByTestId('time')).toHaveTextContent('hh:mm:ss')
    await set({ mediaDuration: 0 })
    expect(screen.getByTestId('time')).toHaveTextContent('hh:mm:ss')
    await set({ mediaDuration: 120 })
    expect(screen.getByTestId('time').querySelector('media-time-display')).not.toBeNull()
  })

  it('takes a custom placeholder', () => {
    renderInStore(() => h(GsTimeDisplay, { placeholder: '--:--' }))
    expect(screen.getByText('--:--')).toBeInTheDocument()
  })

  it('shows the current time, the remaining time or the duration', () => {
    const time = (mode: 'current' | 'remaining' | 'duration') => {
      const view = renderInStore(() => h(GsTimeDisplay, { mode }), loaded)
      const element = view.container.querySelector('.timeDisplay > *')
      view.unmount()
      return element
    }
    expect(time('current')?.tagName).toBe('MEDIA-TIME-DISPLAY')
    expect(time('current')).not.toHaveAttribute('remaining')
    expect(time('remaining')?.tagName).toBe('MEDIA-TIME-DISPLAY')
    expect(time('remaining')).toHaveAttribute('remaining')
    expect(time('duration')?.tagName).toBe('MEDIA-DURATION-DISPLAY')
  })

  it('is marked disabled by its prop or its container', () => {
    renderInStore(() => [
      h(GsTimeDisplay, { disabled: true, 'data-testid': 'own' }),
      h(GsTimeDisplay, { 'data-testid': 'plain', class: 'mine' }),
    ])
    expect(screen.getByTestId('own')).toHaveAttribute('data-disabled')
    expect(screen.getByTestId('plain')).not.toHaveAttribute('data-disabled')
    expect(screen.getByTestId('plain')).toHaveClass('timeDisplay', 'mine')
  })
})

describe('GsTimeRange', () => {
  it("renders media-chrome's time range, labelled Seek, with the hover time inside", () => {
    renderInStore(() => h(GsTimeRange, { class: 'mine', 'data-testid': 'range' }))
    expect(screen.getByTestId('range')).toHaveClass('timeRange', 'mine')
    const range = document.querySelector('media-time-range')
    expect(range).toHaveAttribute('aria-label', 'Seek')
    expect(range).not.toHaveAttribute('disabled')
    expect(range?.querySelector('media-time-display')).toHaveAttribute('slot', 'current')
  })

  it('is disabled by its prop or its container', () => {
    renderInStore(() => h(GsTimeRange), {}, { disabled: true })
    expect(document.querySelector('media-time-range')).toHaveAttribute('disabled')
    expect(document.querySelector('media-time-range')).toHaveAttribute('data-disabled')
  })
})

describe('GsVolumeSlider', () => {
  it("renders media-chrome's volume range, labelled Volume", () => {
    renderInStore(() => h(GsVolumeSlider, { class: 'mine', 'data-testid': 'volume' }))
    expect(screen.getByTestId('volume')).toHaveClass('volumeSlider', 'mine')
    expect(document.querySelector('media-volume-range')).toHaveAttribute('aria-label', 'Volume')
    expect(screen.queryByText('Volume')).toBeNull()
  })

  it('shows a label with showLabel', () => {
    renderInStore(() => h(GsVolumeSlider, { showLabel: true }))
    expect(screen.getByText('Volume')).toBeInTheDocument()
  })

  it('is disabled by its prop', () => {
    renderInStore(() => h(GsVolumeSlider, { disabled: true, 'data-testid': 'volume' }))
    expect(screen.getByTestId('volume')).toHaveAttribute('data-disabled')
    expect(document.querySelector('media-volume-range')).toHaveAttribute('disabled')
  })
})

describe('media store composables', () => {
  it('follow the store once it is ready, and stop listening when unmounted', async () => {
    const fake = createStore({ mediaPaused: false })
    const storeRef = shallowRef<GsMediaStore | undefined>()
    const Probe = defineComponent({
      setup() {
        const paused = useMediaSelector((state) => state.mediaPaused ?? true)
        const dispatch = useMediaDispatch()
        return () =>
          h('button', { onClick: () => dispatch({ type: 'test' }) }, String(paused.value))
      },
    })
    const view = render(() => h(StoreHost, { store: storeRef }, () => h(Probe)))
    // No store yet: the selector sees an empty state and requests are dropped.
    expect(screen.getByRole('button')).toHaveTextContent('true')
    await userEvent.click(screen.getByRole('button'))
    expect(fake.dispatch).not.toHaveBeenCalled()

    storeRef.value = fake.store
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('false'))
    await userEvent.click(screen.getByRole('button'))
    expect(fake.dispatch).toHaveBeenCalledWith({ type: 'test' })

    expect(fake.listeners.size).toBe(1)
    view.unmount()
    expect(fake.listeners.size).toBe(0)
  })
})

/**
 * jsdom lacks what media-chrome needs (`matchMedia`, track lists, playback), so the controller
 * tests below stub just enough of it for media-chrome's own elements and store to run.
 */
describe('GsMediaController with media-chrome', () => {
  beforeAll(() => {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList
    // Empty track lists: event targets that iterate over nothing.
    for (const name of ['textTracks', 'audioTracks', 'videoTracks']) {
      Object.defineProperty(HTMLMediaElement.prototype, name, {
        configurable: true,
        get(this: HTMLMediaElement & Record<string, EventTarget>) {
          return (this[`_${name}`] ??= Object.assign(new EventTarget(), {
            length: 0,
            *[Symbol.iterator]() {},
          }))
        },
      })
    }
    HTMLMediaElement.prototype.load = () => {}
    HTMLMediaElement.prototype.pause = () => {}
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function renderPlayer(props: Record<string, unknown> = {}) {
    const utils = render(() =>
      h(GsMediaController, { audio: true, 'data-testid': 'controller', ...props }, () => [
        h('audio', { slot: 'media', src: 'track.mp3' }),
        h(GsMediaControls, null, () => [h(GsPlayButton), h(GsMuteButton), h(GsTimeRange)]),
      ]),
    )
    const controller = screen.getByTestId<HTMLElement & { mediaStore?: object }>('controller')
    const audio = controller.querySelector('audio') as HTMLAudioElement
    return { ...utils, controller, audio }
  }

  it("renders media-chrome's controller with its options as attributes", () => {
    const { controller } = renderPlayer({
      noHotkeys: true,
      hotkeys: 'noarrowleft',
      noVolumePref: true,
      noMutedPref: true,
      lang: 'fr',
    })
    expect(controller.tagName).toBe('MEDIA-CONTROLLER')
    expect(controller).toHaveAttribute('audio', '')
    expect(controller).toHaveAttribute('nohotkeys', '')
    expect(controller).toHaveAttribute('hotkeys', 'noarrowleft')
    expect(controller).toHaveAttribute('novolumepref', '')
    expect(controller).toHaveAttribute('nomutedpref', '')
    expect(controller).toHaveAttribute('lang', 'fr')
  })

  it('leaves options off by default', () => {
    render(GsMediaController, { attrs: { 'data-testid': 'controller' } })
    const element = screen.getByTestId('controller')
    for (const name of ['audio', 'nohotkeys', 'hotkeys', 'novolumepref', 'nomutedpref', 'lang']) {
      expect(element).not.toHaveAttribute(name)
    }
  })

  it("connects the controls to the controller's store and media", async () => {
    const { controller, audio } = renderPlayer()
    await waitFor(() => expect(controller.mediaStore).toBeDefined())
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()

    await userEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(play).toHaveBeenCalledOnce()

    // The media reports that it plays, and the button follows.
    Object.defineProperty(audio, 'paused', { configurable: true, value: false })
    await fireEvent(audio, new Event('play'))
    expect(await screen.findByRole('button', { name: 'Pause' })).toBeInTheDocument()
  })

  it("handles Space on its buttons itself, rather than as the controller's play shortcut", async () => {
    const { controller, audio } = renderPlayer()
    await waitFor(() => expect(controller.mediaStore).toBeDefined())
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()

    screen.getByRole('button', { name: 'Mute' }).focus()
    await userEvent.keyboard(' ')
    expect(audio.muted).toBe(true)
    expect(play).not.toHaveBeenCalled()
  })
})
