import type { PrimitiveProps } from 'reka-ui'

export interface GsLinkProps extends PrimitiveProps {
  /** Link destination. Ignored while disabled. */
  href?: string
  /** Prevents navigation, removes the link from the tab order and applies disabled styling. */
  disabled?: boolean
}
