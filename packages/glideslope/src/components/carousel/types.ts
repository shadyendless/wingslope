import type { GsButtonStyleProps } from '../button/types'
import type { GsSelectFieldClasses, GsSelectFieldProps } from '../select-field/types'

/** One media item in a carousel. */
export interface GsCarouselData {
  /** The media type, which decides how `GsCarouselViewer` shows the item. */
  dataType: 'image' | 'video' | 'audio'
  /** URL of the full-size media shown in the viewer. */
  dataUrl: string
  /** Original file name of the media asset. */
  fileName: string
  /** Optional metadata associated with the item. */
  metadata?: Record<string, unknown>
  /** Display title: the image's alternative text, the gallery thumbnail's name and the select's label. */
  title: string
  /** URL of the thumbnail shown in the gallery, also the video's poster. */
  thumbnailUrl: string
  /** Unique identifier for the item. */
  id: string | number
}

export interface GsCarouselProps {
  /** The media items to navigate. @default [] */
  items?: GsCarouselData[]
}

/** The carousel state its parts read, also returned by `useCarousel()`. */
export interface GsCarouselState {
  /** The carousel's items. */
  readonly items: readonly GsCarouselData[]
  /** Zero-based index of the active item (the carousel's `v-model`). */
  readonly position: number
  /** Makes the item at `index` the active one. */
  setPosition: (index: number) => void
}

export interface GsCarouselViewerProps {
  /** Extra classes for inner parts. Classes on the viewer itself go on its container. */
  classes?: {
    /** The box around the displayed media (image, video or audio). */
    media?: string
  }
}

export interface GsCarouselGalleryProps {
  /** Extra classes for inner parts. Classes on the gallery itself go on its container. */
  classes?: {
    /** Every thumbnail button. */
    item?: string
  }
}

export interface GsCarouselNavigationProps extends GsButtonStyleProps {
  /**
   * Disables the button. It is also disabled at the first item (previous) or the last item
   * (next).
   */
  disabled?: boolean
}

export interface GsCarouselSelectProps extends Pick<GsSelectFieldProps, 'size' | 'disabled'> {
  /** Extra classes for inner parts. Classes on the select itself go on the field wrapper. */
  classes?: {
    /** Classes for the parts of the `GsSelectField`. */
    select?: GsSelectFieldClasses
    /** Every option. */
    option?: string
  }
}
