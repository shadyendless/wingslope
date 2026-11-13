export type GsTabsAlign = 'start' | 'center' | 'end'

export interface GsTabStyleProps {
  /** Horizontal only: alignment of the tab labels. @default 'start' */
  align?: GsTabsAlign
  /** Horizontal only: tabs grow to share the list's width (up to a maximum). @default true */
  flex?: boolean
}

export interface GsTabsProps extends GsTabStyleProps {
  /** @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  /** `automatic` selects a tab as soon as it receives focus; `manual` waits for Enter/Space. @default 'automatic' */
  activationMode?: 'automatic' | 'manual'
  /**
   * Disables every tab. The selected tab and its panel still show, but no tab can be focused or
   * selected.
   */
  disabled?: boolean
}

export interface GsTabProps extends GsTabStyleProps {
  /** Value selecting this tab and its `GsTabPanel`. */
  value: string | number
  /** Prevents selecting this tab. */
  disabled?: boolean
}

export interface GsTabPanelProps {
  /** Value of the `GsTab` this panel belongs to. */
  value: string | number
}

/** Defaults `provideTabsDefaults` sets for every `GsTabs` below it. */
export type GsTabsDefaults = Pick<
  GsTabsProps,
  'orientation' | 'activationMode' | 'align' | 'flex' | 'disabled'
>

/** Defaults `provideTabDefaults` sets for every `GsTab` below it. */
export type GsTabDefaults = Pick<GsTabProps, 'align' | 'flex' | 'disabled'>
