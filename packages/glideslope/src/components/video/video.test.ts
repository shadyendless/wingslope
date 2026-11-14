import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, shallowRef } from 'vue'
import { provideMediaStore } from '../media-controls/context'
import GsMediaControls from '../media-controls/GsMediaControls.vue'
import GsPlayButton from '../media-controls/GsPlayButton.vue'
import type { GsMediaState, GsMediaStore } from '../media-controls/types'
import GsVideo from './GsVideo.vue'
import GsVideoStatus from './GsVideoStatus.vue'
import type { GsVideoProps } from './types'

// jsdom can't run media-chrome, so these tests render the player unconnected and fire the
// `<video>` element's events by hand. The loading overlay is tested against a store below.

function setup(props: Partial<GsVideoProps> = {}, attrs: Record<string, unknown> = {}) {
  const utils = render(GsVideo, {
    props: { src: 'clip.mp4', ...props },
    attrs: { 'data-testid': 'player', ...attrs },
  })
  const video = utils.container.querySelector('video') as HTMLVideoElement
  return { view: utils, video, player: screen.getByTestId('player') }
}

/** Gives the `<video>` element a `MediaError`, which jsdom never sets. */
function failWith(video: HTMLVideoElement, error: { code: number; message?: string } | null) {
  Object.defineProperty(video, 'error', { configurable: true, value: error })
  return fireEvent.error(video)
}

describe('GsVideo', () => {
  it("renders a <video> in media-chrome's controller, set up for video", () => {
    const { video, player } = setup({ classes: { video: 'mine' } })
    expect(player.tagName).toBe('MEDIA-CONTROLLER')
    expect(player).not.toHaveAttribute('audio')
    expect(player).toHaveClass('group/video', 'container')
    expect(video.parentElement).toBe(player)
    expect(video).toHaveAttribute('slot', 'media')
    expect(video).toHaveAttribute('src', 'clip.mp4')
    expect(video).toHaveAttribute('playsinline')
    expect(video).toHaveClass('video', 'mine')
  })

  it('passes the media options to the <video> element', () => {
    const { video } = setup({
      poster: 'poster.png',
      autoplay: true,
      loop: true,
      muted: true,
      preload: 'auto',
      crossorigin: 'use-credentials',
    })
    expect(video).toHaveAttribute('poster', 'poster.png')
    expect(video.autoplay).toBe(true)
    expect(video.loop).toBe(true)
    expect(video.muted).toBe(true)
    expect(video).toHaveAttribute('preload', 'auto')
    expect(video).toHaveAttribute('crossorigin', 'use-credentials')
  })

  it('preloads metadata by default', () => {
    expect(setup().video).toHaveAttribute('preload', 'metadata')
  })

  it('passes the controller options to media-chrome', () => {
    const { player } = setup({ noHotkeys: true, noVolumePref: true, noMutedPref: true, lang: 'en' })
    expect(player).toHaveAttribute('nohotkeys')
    expect(player).toHaveAttribute('novolumepref')
    expect(player).toHaveAttribute('nomutedpref')
    expect(player).toHaveAttribute('lang', 'en')
  })

  it('renders the default controls in an overlay media-chrome never hides', () => {
    const { view } = setup({
      classes: { mediaControls: 'm', timeRow: 't', controlsRow: 'c' },
    })
    const names = screen.getAllByRole('button').map((button) => button.getAttribute('aria-label'))
    expect(names).toEqual([
      'Mute',
      'Seek backward 10 seconds',
      'Play',
      'Seek forward 10 seconds',
      'Playback rate 1x',
      'Enter fullscreen',
    ])
    expect(view.container.querySelector('.controlsOverlay')).toHaveAttribute('noautohide')
    expect(view.container.querySelector('media-time-range')).not.toBeNull()
    expect(view.container.querySelector('.controls')).toHaveClass('m')
    expect(view.container.querySelector('.timeRow')).toHaveClass('t')
    expect(view.container.querySelector('.controlsRow')).toHaveClass('c')
  })

  it('replaces the controls with its default slot, keeping the overlays', () => {
    render(GsVideo, {
      props: { src: 'clip.mp4' },
      slots: { default: () => h(GsPlayButton) },
    })
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('status', { name: 'Loading video' })).toBeInTheDocument()
  })

  it("emits the media element's events", async () => {
    const { video, view } = setup()
    for (const type of ['play', 'pause', 'loadedmetadata', 'ended']) {
      await fireEvent(video, new Event(type))
    }
    expect(view.emitted('play')).toHaveLength(1)
    expect(view.emitted('pause')).toHaveLength(1)
    expect(view.emitted('loadedMetadata')).toHaveLength(1)
    expect(view.emitted('ended')).toEqual([[]])
  })

  it('emits the playback position', async () => {
    const { video, view } = setup()
    Object.defineProperty(video, 'currentTime', { configurable: true, value: 7 })
    await fireEvent(video, new Event('timeupdate'))
    expect(view.emitted('timeUpdate')).toEqual([[7]])
  })

  describe('disabled', () => {
    it('marks the player and disables every control', () => {
      const { player } = setup({ disabled: true })
      expect(player).toHaveAttribute('data-disabled')
      for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled()
    })

    it('disables custom controls too', () => {
      render(GsVideo, {
        props: { src: 'clip.mp4', disabled: true },
        slots: { default: () => h(GsMediaControls, null, () => h(GsPlayButton)) },
      })
      expect(screen.getByRole('button', { name: 'Play' })).toBeDisabled()
    })

    it('is enabled by default', () => {
      const { player } = setup()
      expect(player).not.toHaveAttribute('data-disabled')
      expect(screen.getByRole('button', { name: 'Enter fullscreen' })).toBeEnabled()
    })
  })

  describe('load errors', () => {
    it('shows an alert, in place of the loading overlay', async () => {
      const { video, view } = setup()
      expect(screen.getByRole('status', { name: 'Loading video' })).toBeInTheDocument()
      await failWith(video, null)
      expect(screen.getByRole('alert')).toHaveTextContent('Unable to load video file')
      expect(screen.queryByRole('status', { name: 'Loading video' })).toBeNull()
      expect(view.emitted('error')).toBeUndefined()
    })

    it("shows media-chrome's message and emits the MediaError", async () => {
      const { video, view } = setup()
      const error = { code: 2, message: 'MEDIA_ERR_NETWORK' }
      await failWith(video, error)
      expect(screen.getByRole('alert')).toHaveTextContent(
        'A network error caused the media download to fail.',
      )
      expect(view.emitted('error')).toEqual([[error]])
    })

    it('disables the controls, custom ones included', async () => {
      const { video } = setup()
      await failWith(video, { code: 4 })
      for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled()
    })

    it('keeps the error overlay with custom controls', async () => {
      const { container } = render(GsVideo, {
        props: { src: 'clip.mp4' },
        slots: { default: () => h(GsPlayButton) },
      })
      await failWith(container.querySelector('video') as HTMLVideoElement, { code: 4 })
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Play' })).toBeDisabled()
    })

    it('clears the error when the source changes', async () => {
      const { video, view } = setup()
      await failWith(video, { code: 4 })
      await view.rerender({ src: 'other.mp4' })
      expect(screen.queryByRole('alert')).toBeNull()
    })
  })
})

describe('GsVideoStatus', () => {
  function renderStatus(state: GsMediaState, error = '') {
    let current = state
    const listeners = new Set<(state: GsMediaState) => void>()
    const store: GsMediaStore = {
      dispatch: vi.fn(),
      getState: () => current,
      subscribe(listener) {
        listeners.add(listener)
        listener(current)
        return () => listeners.delete(listener)
      },
    }
    const Host = defineComponent({
      setup(_, { slots }) {
        provideMediaStore(shallowRef(store))
        return () => slots.default?.()
      },
    })
    render(() => h(Host, null, () => h(GsVideoStatus, { error })))
    return async (next: GsMediaState) => {
      current = { ...current, ...next }
      listeners.forEach((listener) => listener(current))
      await nextTick()
    }
  }

  const loading = () => screen.queryByRole('status', { name: 'Loading video' })

  it('shows the loading overlay until the metadata loads, and while buffering', async () => {
    const set = renderStatus({ mediaLoading: true, mediaDuration: Number.NaN })
    expect(loading()).toBeInTheDocument()
    await set({ mediaLoading: false })
    expect(loading()).toBeInTheDocument()
    await set({ mediaDuration: 30 })
    expect(loading()).toBeNull()
    await set({ mediaLoading: true })
    expect(loading()).toBeInTheDocument()
  })

  it('shows the error instead of the loading overlay', () => {
    renderStatus({ mediaLoading: true }, 'Unable to load video file')
    expect(loading()).toBeNull()
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load video file')
  })
})
