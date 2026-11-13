import type { GsButtonColor, GsButtonVariant } from '../button/types'

export type GsNoticeColor = 'info' | 'advisory' | 'normal' | 'serious' | 'critical'
export type GsNoticeSize = 'small' | 'medium'
export type GsNoticePlacement =
  'top left' | 'top' | 'top right' | 'right' | 'bottom right' | 'bottom' | 'bottom left' | 'left'
/** Which of a notice's action buttons was chosen. */
export type GsNoticeActionKind = 'primary' | 'secondary'
/** Data of your own attached to a queued notice. */
export type GsNoticeMetadata = Record<string, unknown>

export interface GsNoticeAction {
  /** Button text. Also announced to screen readers as the action's alternative. */
  label: string
  /** Called when the action is chosen. */
  onAction?: () => void
  color?: GsButtonColor
  variant?: GsButtonVariant
}

/** A notice as stored in the queue. */
export interface GsNoticeContent {
  id: string
  message: string
  /** @default the list's `defaultColor` */
  color?: GsNoticeColor
  primary?: GsNoticeAction
  secondary?: GsNoticeAction
  /** Auto-dismiss after this many milliseconds. @default the list's `defaultTimeout` */
  timeout?: number
  /** `id` of the `GsNoticeList` that should show it. Omit for lists without an `id`. */
  target?: string
  /**
   * Data of your own. It is passed to `onAction` and `onClose` listeners and matched by
   * `dequeue({ metadata })`.
   */
  metadata?: GsNoticeMetadata
  /** Hide the status icon. */
  hideIcon?: boolean
  /** Show a close button. @default true, unless the notice has a timeout and both actions */
  showClose?: boolean
  /** Close after an action is chosen. */
  closeOnAction?: boolean
}

export type GsNoticeInput = Omit<GsNoticeContent, 'id'> & { id?: string }

/**
 * Which notices `dequeue` removes. A notice must match every criterion given: `id` and `target`
 * exactly, `color` against the color it is shown in, and each `metadata` key deeply equal to the
 * notice's. Without `target`, notices in every list match.
 */
export interface GsNoticeFilter {
  id?: string
  target?: string
  color?: GsNoticeColor
  metadata?: GsNoticeMetadata
}

/** Payload of `onClose` listeners. */
export interface GsNoticeEvent {
  id: string
  metadata?: GsNoticeMetadata
}

/** Payload of `onAction` listeners. */
export interface GsNoticeActionEvent extends GsNoticeEvent {
  action: GsNoticeActionKind
}

/** Classes for a notice's inner parts. */
export interface GsNoticeClasses {
  /** The row holding the icon, message and actions. */
  content?: string
  /** The message text. */
  message?: string
  /** The action buttons' container. */
  actions?: string
}

export interface GsNoticeProps {
  message: string
  /** @default 'info' */
  color?: GsNoticeColor
  primary?: GsNoticeAction
  secondary?: GsNoticeAction
  /** @default 'medium' */
  size?: GsNoticeSize
  /** Hide the status icon. */
  hideIcon?: boolean
  /** Show a close button. */
  showClose?: boolean
  /** Close after an action is chosen. */
  closeOnAction?: boolean
  /** Auto-dismiss after this many milliseconds. Omit to keep it open. */
  timeout?: number
  /** Classes for inner parts: `content`, `message` and `actions`. */
  classes?: GsNoticeClasses
}

export interface GsNoticeListProps {
  /**
   * Lets notices target this list with `queue({ target: id })`. A list with an `id` shows only the
   * notices targeting it; a list without one shows the notices that have no `target`.
   */
  id?: string
  /**
   * Render the list at the end of `body` and position it against the viewport, instead of in place
   * and against its positioned parent. Use with `placement`.
   */
  global?: boolean
  /**
   * Edge or corner of the positioned parent (or the viewport, when `global`) to stack notices on.
   * Omit to render the list in place, in the page flow.
   */
  placement?: GsNoticePlacement
  /** Most notices shown at once. Newer notices push older ones out of view until they close. @default 3 */
  limit?: number
  /** @default 'info' */
  defaultColor?: GsNoticeColor
  /** Auto-dismiss time for notices without their own `timeout`. */
  defaultTimeout?: number
  /** @default 'medium' */
  size?: GsNoticeSize
  /** Hide the "Clear all" button shown when several notices are visible. */
  hideClearAll?: boolean
  /**
   * Accessible name of the list's region, followed by the keyboard shortcut that focuses it. Give
   * each list on a page its own label. @default 'Notifications'
   */
  label?: string
  /**
   * Classes for inner parts. `list`: the list of notices. `button`: the "Clear all" button.
   * `notice`: each notice, with `notice` for its root and `content`, `message` and `actions` for
   * its parts (as in `GsNotice`'s `classes`).
   */
  classes?: {
    list?: string
    button?: string
    notice?: GsNoticeClasses & { notice?: string }
  }
}
