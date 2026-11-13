import { defineComponent, h, type DefineSetupFnComponent, type VNode } from 'vue'

export type GsIconProps = {
  /**
   * Accessible name for the icon. When set, the icon is exposed as `role="img"` with a `<title>`.
   * When omitted, the icon is decorative and hidden from assistive technology.
   */
  title?: string
}

export type GsIconComponent = DefineSetupFnComponent<GsIconProps>

/**
 * Creates an icon component from static SVG children.
 *
 * Icons inherit `currentColor` and default to `1em` square; CSS sizing (for example from `GsIcon`)
 * overrides that. Attributes such as `class` or `style` fall through to the `<svg>` element.
 */
export function createIcon(
  name: string,
  viewBox: string,
  children: () => VNode[],
): GsIconComponent {
  return defineComponent(
    (props: GsIconProps) => () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox,
          // Presentational attributes: any CSS width/height (e.g. from GsIcon) takes precedence.
          width: '1em',
          height: '1em',
          fill: 'none',
          focusable: 'false',
          ...(props.title ? { role: 'img' } : { 'aria-hidden': 'true' }),
        },
        props.title ? [h('title', props.title), ...children()] : children(),
      ),
    { name, props: { title: { type: String, required: false, default: undefined } } },
  )
}
