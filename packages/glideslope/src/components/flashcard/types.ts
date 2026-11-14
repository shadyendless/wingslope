export interface GsFlashcardProps {
  /** Shows skeleton placeholders in the hero and details, and hides the additional data. */
  loading?: boolean
  /** Primary header text, shown in `GsFlashcardHero`. */
  header: string
  /** Secondary text below the header. */
  subheader: string
}

/** The flashcard state its parts read, also returned by `useFlashcard()`. */
export interface GsFlashcardState {
  readonly loading: boolean
  readonly header: string
  readonly subheader: string
}
