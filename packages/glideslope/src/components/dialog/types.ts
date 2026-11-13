export type GsDialogSize = 'small' | 'large'

export interface GsDialogProps {
  /** `small` (280px) for confirmations, `large` (320–720px) for richer content. @default 'small' */
  size?: GsDialogSize
  /** Close when clicking the backdrop. @default false */
  dismissable?: boolean
  /** Keep the dialog open when Escape is pressed. @default false */
  keyboardDismissDisabled?: boolean
  /**
   * Element or selector to render the dialog into. The backdrop then covers only that element,
   * which needs `position: relative` (or another positioning). @default 'body'
   */
  portalTo?: string | HTMLElement
  /**
   * Classes for inner parts. `overlay`: the backdrop. `dialog`: the panel (the Design Toolkit's
   * `modal` and `dialog`, which are one element here).
   */
  classes?: { overlay?: string; dialog?: string }
}
