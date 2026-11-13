/**
 * Keeps Tailwind's named group and peer classes (`group/checkbox`, `peer/input`) global inside
 * CSS Modules.
 *
 * Variants such as `@variant group-hover/checkbox` compile to selectors containing
 * `.group\/checkbox`. CSS Modules would hash that class like any other, but components put the
 * literal `group/checkbox` class on their root, so the selector would never match. This plugin
 * wraps those classes in `:global()` before CSS Modules runs.
 *
 * Only `*.module.css` files are touched: `:global()` means nothing in plain CSS.
 *
 * @returns {import('postcss').Plugin}
 */
export default function globalGroups() {
  const NAMED_GROUP = /(?<!:global\()\.((?:group|peer)\\\/[\w-]+)/g
  const MODULE_FILE = /\.module\.css(?:\?|$)/

  return {
    postcssPlugin: 'glideslope-global-groups',
    Once(root) {
      if (!MODULE_FILE.test(root.source?.input.file ?? '')) return
      root.walkRules((rule) => {
        if (rule.selector.includes('\\/')) {
          rule.selector = rule.selector.replace(NAMED_GROUP, ':global(.$1)')
        }
      })
    },
  }
}

globalGroups.postcss = true
