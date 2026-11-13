# Design tokens

All tokens come from two JSON files:

- [`primitive.json`](./primitive.json): raw values (the color palettes, typography, spacing, radius, shadows, fonts, icon sizes, animation).
- [`semantic.json`](./semantic.json): named roles (`bg.surface.default`, `fg.primary.bold`, …) for the `light` and `dark` themes, each pointing at a primitive such as `--primitive-neutral-900`. Both themes must define the same tokens.

`pnpm generate` (run by `pnpm build`) produces, in this folder:

| File         | Contents                                                                         |
| ------------ | -------------------------------------------------------------------------------- |
| `tokens.css` | Every primitive as a CSS variable in a Tailwind `@theme static` block            |
| `themes.css` | Every semantic token as `light-dark(var(--light), var(--dark))`                  |
| `types.ts`   | TypeScript types derived from the JSON (`ThemeTokens`, `SemanticColorTokens`, …) |
| `index.ts`   | `designTokens`, with colors as RGBA tuples and `px` values as numbers            |

Never edit generated files. The generator fails on a semantic token that references a missing primitive or is missing from one theme.

## Formats

CSS uses standard colors (alpha 0–1). JavaScript uses deck.gl RGBA tuples, with **every channel 0–255** including alpha, so values can go straight into WebGL layers:

```ts
designTokens.dark.bg.surface.muted // [255, 255, 255, 20] (8% white)
```

In Vue, prefer `useTheme().tokens` from `@wingbrace/glideslope`. It follows the active theme and applies any token overrides.

## Shadows

`light-dark()` only accepts colors, so shadow tokens keep their offsets and switch just the color: `0 1px 4px 0 light-dark(<light>, <dark>)`. The light and dark shadows therefore have to share offsets.
