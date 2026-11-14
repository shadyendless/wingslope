import type { GsMediaPlayerProps } from '../media-controls/types'

export interface GsAudioProps extends GsMediaPlayerProps {
  /** Title shown above the controls, such as the file name. */
  title?: string
  /**
   * Classes for inner parts of the default layout. `title`: the title. `mediaControls`: the
   * controls wrapper. `timeRow`: the time and seek bar row. `controlsRow`: the button row.
   */
  classes?: {
    title?: string
    mediaControls?: string
    timeRow?: string
    controlsRow?: string
  }
}
