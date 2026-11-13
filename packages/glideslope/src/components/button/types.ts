import type { PrimitiveProps } from 'reka-ui'

export type GsButtonSize = 'large' | 'medium' | 'small' | 'xsmall'
export type GsButtonColor = 'mono-muted' | 'mono-bold' | 'accent' | 'serious' | 'critical'
export type GsButtonVariant = 'filled' | 'flat' | 'icon' | 'outline'
/** Toggle buttons support every variant except `filled`. */
export type GsToggleButtonVariant = Exclude<GsButtonVariant, 'filled'>

export interface GsButtonStyleProps {
  /** Size of the button. @default 'medium' */
  size?: GsButtonSize
  /** Semantic color. @default 'mono-muted' */
  color?: GsButtonColor
  /** Visual style. @default 'filled' */
  variant?: GsButtonVariant
}

export interface GsButtonProps extends GsButtonStyleProps, PrimitiveProps {
  /** Native button type. Defaults to `button` so buttons never submit a form by accident. */
  type?: 'button' | 'submit' | 'reset'
  /** Prevents interaction and applies disabled styling. */
  disabled?: boolean
}

export interface GsLinkButtonProps extends GsButtonStyleProps, PrimitiveProps {
  /** Link destination. Ignored while disabled. */
  href?: string
  /** Prevents navigation, removes the link from the tab order and applies disabled styling. */
  disabled?: boolean
}

export interface GsToggleButtonProps extends Omit<GsButtonStyleProps, 'variant'>, PrimitiveProps {
  /** Visual style. @default 'flat' */
  variant?: GsToggleButtonVariant
  /** Prevents interaction and applies disabled styling. */
  disabled?: boolean
}

export type GsButtonDefaults = GsButtonStyleProps
export type GsLinkButtonDefaults = GsButtonStyleProps
export type GsToggleButtonDefaults = Omit<GsButtonStyleProps, 'variant'> & {
  variant?: GsToggleButtonVariant
}
