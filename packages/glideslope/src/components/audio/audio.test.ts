import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vite-plus/test'
import { h } from 'vue'
import GsMediaControls from '../media-controls/GsMediaControls.vue'
import GsPlayButton from '../media-controls/GsPlayButton.vue'
import GsAudio from './GsAudio.vue'
import type { GsAudioProps } from './types'

// jsdom can't run media-chrome, so these tests render the player unconnected and fire the
// `<audio>` element's events by hand.

function setup(props: Partial<GsAudioProps> = {}, attrs: Record<string, unknown> = {}) {
  const utils = render(GsAudio, {
    props: { src: 'track.mp3', ...props },
    attrs: { 'data-testid': 'player', ...attrs },
  })
  const audio = utils.container.querySelector('audio') as HTMLAudioElement
  return { view: utils, audio, player: screen.getByTestId('player') }
}

/** Gives the `<audio>` element a `MediaError`, which jsdom never sets. */
function failWith(audio: HTMLAudioElement, error: { code: number; message?: string } | null) {
  Object.defineProperty(audio, 'error', { configurable: true, value: error })
  return fireEvent.error(audio)
}

describe('GsAudio', () => {
  it("renders a hidden <audio> in media-chrome's controller, set up for audio", () => {
    const { audio, player } = setup()
    expect(player.tagName).toBe('MEDIA-CONTROLLER')
    expect(player).toHaveAttribute('audio')
    expect(player).toHaveClass('group/audio', 'container')
    expect(audio.parentElement).toBe(player)
    expect(audio).toHaveAttribute('slot', 'media')
    expect(audio).toHaveAttribute('src', 'track.mp3')
    expect(audio).toHaveClass('audio')
  })

  it('passes the media options to the <audio> element', () => {
    const { audio } = setup({ autoplay: true, loop: true, muted: true, crossorigin: 'anonymous' })
    expect(audio.autoplay).toBe(true)
    expect(audio.loop).toBe(true)
    expect(audio.muted).toBe(true)
    expect(audio).toHaveAttribute('crossorigin', 'anonymous')
    expect(audio).toHaveAttribute('preload', 'metadata')
  })

  it('takes another preload', () => {
    const { audio } = setup({ preload: 'none' })
    expect(audio).toHaveAttribute('preload', 'none')
  })

  it('passes the controller options to media-chrome', () => {
    const { player } = setup({
      noHotkeys: true,
      hotkeys: 'nok',
      noVolumePref: true,
      noMutedPref: true,
    })
    expect(player).toHaveAttribute('nohotkeys')
    expect(player).toHaveAttribute('hotkeys', 'nok')
    expect(player).toHaveAttribute('novolumepref')
    expect(player).toHaveAttribute('nomutedpref')
  })

  it('shows a title only when given', async () => {
    const { view } = setup({ title: 'Track.mp3', classes: { title: 'mine' } })
    expect(screen.getByText('Track.mp3')).toHaveClass('titleRow', 'mine')
    await view.rerender({ title: undefined })
    expect(screen.queryByText('Track.mp3')).toBeNull()
  })

  it('renders the default controls', () => {
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
    ])
    expect(view.container.querySelector('media-time-range')).not.toBeNull()
    expect(view.container.querySelector('media-volume-range')).not.toBeNull()
    expect(screen.getAllByText('hh:mm:ss')).toHaveLength(2)
    expect(view.container.querySelector('.controls')).toHaveClass('m')
    expect(view.container.querySelector('.timeRow')).toHaveClass('t')
    expect(view.container.querySelector('.controlsRow')).toHaveClass('c')
  })

  it('cycles through custom playback rates', () => {
    setup({ playbackRates: [1.5, 2] })
    expect(screen.getByRole('button', { name: /Playback rate/ })).toHaveAccessibleName(
      'Playback rate 1x',
    )
  })

  it('replaces the layout with its default slot', () => {
    render(GsAudio, {
      props: { src: 'track.mp3', title: 'Hidden title' },
      slots: { default: () => h(GsPlayButton) },
    })
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
    expect(screen.queryByText('Hidden title')).toBeNull()
  })

  it("emits the media element's events", async () => {
    const { audio, view } = setup()
    await fireEvent(audio, new Event('play'))
    await fireEvent(audio, new Event('pause'))
    await fireEvent(audio, new Event('loadedmetadata'))
    await fireEvent(audio, new Event('ended'))
    expect(view.emitted('play')).toHaveLength(1)
    expect(view.emitted<[Event]>('pause')?.[0]?.[0]).toBeInstanceOf(Event)
    expect(view.emitted('loadedMetadata')).toHaveLength(1)
    expect(view.emitted('ended')).toEqual([[]])
  })

  it('emits the playback position, skipping non-finite ones', async () => {
    const { audio, view } = setup()
    for (const time of [12.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      Object.defineProperty(audio, 'currentTime', { configurable: true, value: time })
      await fireEvent(audio, new Event('timeupdate'))
    }
    expect(view.emitted('timeUpdate')).toEqual([[12.5]])
  })

  describe('disabled', () => {
    it('marks the player and disables every control', () => {
      const { player } = setup({ disabled: true })
      expect(player).toHaveAttribute('data-disabled')
      for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled()
      expect(document.querySelector('media-time-range')).toHaveAttribute('disabled')
    })

    it('disables custom controls too', () => {
      render(GsAudio, {
        props: { src: 'track.mp3', disabled: true },
        slots: { default: () => h(GsMediaControls, null, () => h(GsPlayButton)) },
      })
      expect(screen.getByRole('button', { name: 'Play' })).toBeDisabled()
    })

    it('is enabled by default', () => {
      const { player } = setup()
      expect(player).not.toHaveAttribute('data-disabled')
      expect(screen.getByRole('button', { name: 'Play' })).toBeEnabled()
    })
  })

  describe('load errors', () => {
    it('shows a fallback message when there is no MediaError', async () => {
      const { audio, view } = setup()
      await failWith(audio, null)
      expect(screen.getByRole('alert')).toHaveTextContent('Unable to load audio file')
      expect(view.emitted('error')).toBeUndefined()
    })

    it('shows the fallback for an aborted load, which media-chrome treats as no error', async () => {
      const { audio } = setup()
      await failWith(audio, { code: 1 })
      expect(screen.getByRole('alert')).toHaveTextContent('Unable to load audio file')
    })

    it.each([
      [2, 'A network error caused the media download to fail.'],
      [
        3,
        'A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.',
      ],
      [
        4,
        'An unsupported error occurred. The server or network failed, or your browser does not support this format.',
      ],
    ])("shows media-chrome's message for error code %i", async (code, message) => {
      const { audio } = setup()
      await failWith(audio, { code })
      expect(screen.getByRole('alert')).toHaveTextContent(message)
    })

    it('emits the MediaError', async () => {
      const { audio, view } = setup()
      const error = { code: 4, message: 'MEDIA_ERR_SRC_NOT_SUPPORTED' }
      await failWith(audio, error)
      expect(view.emitted('error')).toEqual([[error]])
    })

    it('disables the controls', async () => {
      const { audio } = setup()
      await failWith(audio, { code: 4 })
      for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled()
    })

    it('clears the error when the source changes', async () => {
      const { audio, view } = setup()
      await failWith(audio, { code: 4 })
      expect(screen.getByRole('alert')).toBeInTheDocument()
      await view.rerender({ src: 'other.mp3' })
      expect(screen.queryByRole('alert')).toBeNull()
      expect(screen.getByRole('button', { name: 'Play' })).toBeEnabled()
    })
  })
})
