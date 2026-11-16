/**
 * Keeps Tailwind's named group and peer classes (`group/checkbox`, `peer/input`) global inside
 * CSS Modules.
 *
 * Variants such as `@variant group-hover/checkbox` compile to selectors containing
 * `.group\/checkbox`. CSS Modules would hash that class like any other, but components put the
 * literal `group/checkbox` class on their root, so the selector would never match. This plugin
 * wraps those classes in `:global()` before CSS Modules runs.
 *
 * The theme classes `.light` and `.dark` (from the foundation's `light` / `dark` variants, which
 * match the class on `<html>`) get the same treatment, or `@variant dark` could never match.
 *
 * Only `*.module.css` files are touched: `:global()` means nothing in plain CSS.
 *
 * @returns {import('postcss').Plugin}
 */
export default function globalGroups() {
  const NAMED_GROUP = /(?<!:global\()\.((?:group|peer)\\\/[\w-]+)/g
  const THEME_CLASS = /(?<!:global\()\.(light|dark)(?![\w-])/g
  const MODULE_FILE = /\.module\.css(?:\?|$)/

  return {
    postcssPlugin: 'glideslope-global-groups',
    Once(root) {
      if (!MODULE_FILE.test(root.source?.input.file ?? '')) return
      root.walkRules((rule) => {
        if (rule.selector.includes('\\/')) {
          rule.selector = rule.selector.replace(NAMED_GROUP, ':global(.$1)')
        }
        if (rule.selector.includes('.light') || rule.selector.includes('.dark')) {
          rule.selector = rule.selector.replace(THEME_CLASS, ':global(.$1)')
        }
      })
    },
  }
}

globalGroups.postcss = true
