import type { MediaState, MediaStore } from 'media-chrome/dist/media-store/media-store.js'

/** media-chrome's media store: the state of the controlled media, and requests to change it. */
export type GsMediaStore = MediaStore

/** A snapshot of the media state (`mediaPaused`, `mediaCurrentTime`, `mediaVolumeLevel`, …). */
export type GsMediaState = Partial<MediaState>

/** A request to change the media state, such as `{ type: MediaActionTypes.MEDIA_SEEK_REQUEST, detail: 30 }`. */
export interface GsMediaAction {
  /** The request type, one of `MediaActionTypes`. */
  type: string
  /** The request's value, such as the time to seek to or the playback rate. */
  detail?: unknown
}

export interface GsMediaControllerProps {
  /**
   * Lays the controller out for audio-only media: no media layer, only the controls. Set it when
   * the media is an `<audio>` element.
   */
  audio?: boolean
  /**
   * Turns off media-chrome's keyboard shortcuts: Space and `k` play and pause, the arrow keys seek
   * and change the volume, `m` mutes and `f` toggles fullscreen.
   */
  noHotkeys?: boolean
  /**
   * Space-separated keyboard shortcuts to turn off, such as `noarrowleft noarrowright`. See
   * [media-chrome's keyboard shortcuts](https://www.media-chrome.org/docs/en/keyboard-shortcuts).
   */
  hotkeys?: string
  /** Don't save the volume in `localStorage` and restore it on the next page load. */
  noVolumePref?: boolean
  /** Don't save the muted state in `localStorage` and restore it on the next page load. */
  noMutedPref?: boolean
  /** Language of media-chrome's built-in labels, such as the time the seek bar announces. */
  lang?: string
}

/** Props shared by `GsAudio` and `GsVideo`: the media element's and the controller's. */
export interface GsMediaPlayerProps extends Omit<GsMediaControllerProps, 'audio'> {
  /**
   * Media URL. The browser must be allowed to load it: from another origin, the server must send
   * CORS headers (`Access-Control-Allow-Origin`), and `crossorigin` may be needed.
   */
  src: string
  /** Disables every control. They are also disabled while the media has failed to load. */
  disabled?: boolean
  /**
   * Playback rates the rate button cycles through. Values that aren't positive finite numbers are
   * left out. @default [1, 2, 3]
   */
  playbackRates?: number[]
  /** Starts playing as soon as possible. Browsers may block autoplay with sound. */
  autoplay?: boolean
  /** Starts again from the beginning when the media ends. */
  loop?: boolean
  /** Starts muted. */
  muted?: boolean
  /** How much of the media to load before it plays. @default 'metadata' */
  preload?: 'none' | 'metadata' | 'auto'
  /** CORS mode for loading the media from another origin. */
  crossorigin?: '' | 'anonymous' | 'use-credentials'
}

export interface GsMediaControlsProps {
  /** Disables every control inside. A control can't enable itself while its container is disabled. */
  disabled?: boolean
}

/** Props shared by the media buttons. Their variant, size and color are fixed. */
export interface GsMediaButtonProps {
  /** Disables the button. A parent `GsMediaControls`, `GsAudio` or `GsVideo` can disable it too. */
  disabled?: boolean
}

export type GsPlayButtonProps = GsMediaButtonProps
export type GsMuteButtonProps = GsMediaButtonProps
export type GsFullscreenButtonProps = GsMediaButtonProps

export type GsSeekDirection = 'forward' | 'backward'

export interface GsSeekButtonProps extends GsMediaButtonProps {
  /** `forward` advances playback, `backward` rewinds it. */
  direction: GsSeekDirection
  /**
   * Seconds to seek by. Values that aren't positive finite numbers (`NaN`, `Infinity`, zero,
   * negatives) fall back to the default, with a console warning. @default 10
   */
  seekOffset?: number
}

export interface GsPlaybackRateButtonProps extends GsMediaButtonProps {
  /**
   * Playback rates the button cycles through. Values that aren't positive finite numbers are left
   * out; when none is left, the default is used, with a console warning. @default [1, 2, 3]
   */
  rates?: number[]
}

export interface GsVolumeSliderProps {
  /** Shows a "Volume" label next to the slider. */
  showLabel?: boolean
  /** Disables the slider. A parent `GsMediaControls`, `GsAudio` or `GsVideo` can disable it too. */
  disabled?: boolean
}

export interface GsTimeRangeProps {
  /** Disables the seek bar. A parent `GsMediaControls`, `GsAudio` or `GsVideo` can disable it too. */
  disabled?: boolean
}

/** `current`: the playback time. `remaining`: the time left. `duration`: the total length. */
export type GsTimeDisplayMode = 'current' | 'remaining' | 'duration'

export interface GsTimeDisplayProps {
  /** Which time to show. @default 'current' */
  mode?: GsTimeDisplayMode
  /** Text shown until the media's duration is known. @default 'hh:mm:ss' */
  placeholder?: string
  /** Dims the display. A parent `GsMediaControls`, `GsAudio` or `GsVideo` can disable it too. */
  disabled?: boolean
}
