export type GsStatus = 'good' | 'degraded' | 'poor' | 'pending' | 'unknown'

export interface GsStatusIndicatorProps {
  /** @default 'good' */
  status?: GsStatus
  /**
   * Visible text shown next to the indicator. Without it, the status name is used as the
   * indicator's accessible name.
   */
  label?: string
}
