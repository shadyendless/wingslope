# @wingbrace/glideslope-foundation

The framework-agnostic base of the Glideslope design system:

- **Design tokens.** Primitive and semantic colors, typography, spacing, radius, shadows and motion, defined once in JSON.
- **A Tailwind v4 theme** built from those tokens, with light and dark values resolved by CSS `light-dark()`.
- **Custom variants** for component props (`size-*`, `color-*`, …) and Reka UI / native states (`open`, `selected`, `disabled`, …).
- **Color utilities** (`bg-*`, `fg-*`, `icon-*`, `outline-*`) that accept opacity modifiers.
- **Tokens for JavaScript**, with colors as deck.gl-style RGBA tuples for canvas and WebGL rendering.

It has no framework dependency. `@wingbrace/glideslope` builds Vue components on top of it.

## Usage

Install it with Tailwind CSS v4 and the fonts:

```bash
pnpm add @wingbrace/glideslope-foundation tailwindcss @fontsource-variable/roboto-flex @fontsource-variable/roboto-mono
```

Import it from your app's Tailwind entry stylesheet:

```css
@import '@wingbrace/glideslope-foundation/styles';
```

Switch themes with a `dark` or `light` class (or `data-theme="dark"`) on `<html>` or any ancestor.

To use the theme from a CSS Module without emitting it again:

```css
@reference '@wingbrace/glideslope-foundation/styles';
```

Read tokens in JavaScript:

```ts
import { designTokens } from '@wingbrace/glideslope-foundation/tokens'

designTokens.dark.bg.surface.default // [21, 21, 23, 255]
designTokens.spacing.m // 12
```

## Exports

| Path                                      | Contents                                         |
| ----------------------------------------- | ------------------------------------------------ |
| `@wingbrace/glideslope-foundation/styles` | Tailwind entry: theme, variants, utilities, base |
| `@wingbrace/glideslope-foundation/tokens` | `designTokens` and its types (`ThemeTokens`, …)  |

## Development

```bash
pnpm --filter @wingbrace/glideslope-foundation build   # regenerate + build
pnpm --filter @wingbrace/glideslope-foundation test
```

The JSON files are the source of truth. After editing them, run `pnpm generate` and commit the regenerated files. A test fails if the generated files are out of date.

- [Styling with Tailwind](./src/documentation/tailwind.md): how Glideslope uses Tailwind, CSS Modules and cascade layers
- [Tokens](./src/tokens/README.md)
- [Variants](./src/variants/README.md)
