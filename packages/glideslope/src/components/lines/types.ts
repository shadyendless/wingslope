export interface GsLinesProps {
  /** Row height the connector spans. @default 'medium' */
  size?: 'large' | 'medium' | 'small'
  /**
   * - `branch`: a vertical line with a tick to the right (a middle child)
   * - `last`: a vertical line that stops at the tick (the last child)
   * - `vert`: a vertical line only (an ancestor's continuing line)
   * @default 'branch'
   */
  variant?: 'branch' | 'vert' | 'last'
  /** Keeps the connector's space but hides it. @default true */
  visible?: boolean
}
