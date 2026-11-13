export interface GsDividerProps {
  /**
   * Direction of the divider. When omitted, it comes from the nearest `provideDividerDefaults()`,
   * falling back to `horizontal`.
   */
  orientation?: 'horizontal' | 'vertical'
  /** Purely visual: hides the divider from assistive technology. */
  decorative?: boolean
}

/** Defaults a parent component can provide to every `GsDivider` below it. */
export interface GsDividerDefaults {
  orientation?: GsDividerProps['orientation']
  /** Extra class on each divider, for parents that style the dividers they contain. */
  class?: string
}
