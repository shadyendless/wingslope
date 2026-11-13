export interface GsPaginationProps {
  /** Number of pages. */
  total: number
  /** Hides the page buttons while results load. */
  loading?: boolean
  /** Page to start on without `v-model` (1-based). @default 1 */
  defaultValue?: number
  /**
   * Classes for the inner parts (`class` goes on the `<nav>` container):
   * - `prev`: the previous-page button
   * - `pages`: each page button
   * - `next`: the next-page button
   */
  classes?: {
    prev?: string
    pages?: string
    next?: string
  }
}
