import type { GsMediaPlayerProps } from '../media-controls/types'

export interface GsVideoProps extends GsMediaPlayerProps {
  /** Image shown until playback starts. */
  poster?: string
  /**
   * Classes for inner parts. `video`: the `<video>` element. `mediaControls`: the controls
   * wrapper. `timeRow`: the time and seek bar row. `controlsRow`: the button row.
   */
  classes?: {
    video?: string
    mediaControls?: string
    timeRow?: string
    controlsRow?: string
  }
}
