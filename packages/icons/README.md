# @wingbrace/glideslope-icons

The Glideslope icon set (259 icons) as tree-shakeable Vue 3 components.

```vue
<script setup lang="ts">
import { SettingsIcon } from '@wingbrace/glideslope-icons'
// or, one module per icon:
import RadarIcon from '@wingbrace/glideslope-icons/radar'
</script>

<template>
  <SettingsIcon />
  <RadarIcon title="Radar coverage" />
</template>
```

- **Naming:** each icon is exported as `<PascalName>Icon` and as the default export of `@wingbrace/glideslope-icons/<kebab-name>`.
- **Color and size:** icons use `currentColor` and default to `1em` square. Inside `GsIcon` from `@wingbrace/glideslope` they take the design system's icon sizes and colors.
- **Accessibility:** icons are decorative (`aria-hidden`) unless you pass a `title`, which makes them `role="img"` with that name.
- **Other attributes** such as `class` and `style` go onto the `<svg>`.

Browse every icon in Storybook under **Components / Icon / Gallery**.

## Adding or changing icons

1. Add or replace the SVG in [`src/svg/`](./src/svg) (kebab-case file name, 24×24 view box).
2. Run `pnpm --filter @wingbrace/glideslope-icons build`.

The generator optimizes each SVG with SVGO, turns the placeholder fills (`#898989`, white) into `currentColor`, and emits static render functions; `innerHTML` is never used. Other colors are kept, for intentionally two-tone icons.
