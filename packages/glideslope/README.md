# @wingbrace/glideslope

Glideslope's Vue 3 component library, built on [Reka UI](https://reka-ui.com) primitives and styled by [`@wingbrace/glideslope-foundation`](../foundation).

## Usage

```bash
pnpm add @wingbrace/glideslope @wingbrace/glideslope-foundation tailwindcss @tailwindcss/vite \
  @fontsource-variable/roboto-flex @fontsource-variable/roboto-mono
```

```css
/* main.css: your Tailwind entry */
@import '@wingbrace/glideslope-foundation/styles';
@import '@wingbrace/glideslope/styles.css';
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { GsButton, GsIcon, provideTheme } from '@wingbrace/glideslope'
import { AddIcon } from '@wingbrace/glideslope-icons'

const theme = provideTheme({ defaultMode: 'dark' })
</script>

<template>
  <GsButton color="accent" @click="theme.toggleMode()">
    <GsIcon><AddIcon /></GsIcon>
    Toggle theme
  </GsButton>
</template>
```

- **Component styles** ship pre-compiled in `styles.css`, inside the `components.l1`–`l5` cascade layers. Any utility class you add (`<GsButton class="rounded-none">`) wins over them.
- **Types** expect `"moduleResolution": "bundler"` (the Vite default).
- **Tree-shaking:** components are plain named exports and tree-shake per component.

See [`apps/playground`](../../apps/playground) for a complete app.

## Components

### Basics

| Family           | Components                                                  | Built on                   |
| ---------------- | ----------------------------------------------------------- | -------------------------- |
| Avatar           | `GsAvatar`                                                  | Reka `Avatar`              |
| Badge            | `GsBadge`                                                   | —                          |
| Button           | `GsButton`, `GsLinkButton`, `GsToggleButton`                | Reka `Primitive`, `Toggle` |
| Details list     | `GsDetailsList`, `GsDetailsListLabel`, `GsDetailsListValue` | —                          |
| Divider          | `GsDivider`                                                 | Reka `Separator`           |
| Hero             | `GsHero`, `GsHeroTitle`, `GsHeroSubtitle`                   | —                          |
| Hotkey           | `GsHotkey`, `GsHotkeySet`                                   | —                          |
| Icon             | `GsIcon`                                                    | —                          |
| Label            | `GsLabel`                                                   | Reka `Label`, `FieldLabel` |
| Lines            | `GsLines`                                                   | —                          |
| Link             | `GsLink`                                                    | Reka `Primitive`           |
| Skeleton         | `GsSkeleton`                                                | —                          |
| Status indicator | `GsStatusIndicator`                                         | —                          |

### Forms

Labeled fields share one layout and use Reka UI's `FieldRoot`, so labels, descriptions, errors and validation (`required`, `validate`, `validation-mode`) are wired up the same way everywhere, including inside a Reka `FormRoot`.

| Family        | Components                                                                                            | Built on                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Input         | `GsInput`                                                                                             | Reka `FieldControl`                                                |
| Text fields   | `GsTextField`, `GsTextAreaField`, `GsSearchField`                                                     | Reka `FieldRoot`, `FieldControl`                                   |
| Checkbox      | `GsCheckbox`, `GsCheckboxGroup`                                                                       | Reka `Checkbox`                                                    |
| Radio         | `GsRadio`, `GsRadioGroup`                                                                             | Reka `RadioGroup`                                                  |
| Switch        | `GsSwitch`                                                                                            | Reka `Switch`                                                      |
| Slider        | `GsSlider`                                                                                            | Reka `Slider`                                                      |
| Options       | `GsOptions`, `GsOption`, `GsOptionSection`, `GsOptionLabel`, `GsOptionDescription`, `GsOptionContent` | Reka `Listbox` / `Select` / `Combobox` items                       |
| Select        | `GsSelectField`                                                                                       | Reka `Select`                                                      |
| Combo box     | `GsComboBoxField`                                                                                     | Reka `Combobox`                                                    |
| Date and time | `GsDateField`, `GsTimeField`                                                                          | Reka `DateField`, `TimeField`                                      |
| Chips         | `GsChip`, `GsChipList`, `GsSelectableChip`, `GsDeletableChip`                                         | Reka `TagGroup`                                                    |
| Color picker  | `GsColorPicker`                                                                                       | Reka `ColorSwatchPicker`, `ColorArea`, `ColorSlider`, `ColorField` |

Field components send `class` and `style` to the field wrapper and every other attribute (`id`, `autocomplete`, `aria-*`, listeners) to the actual control. Date and time values are `@internationalized/date` objects.

Composables: `provideTheme` / `useTheme`, plus `provide*Defaults` for families whose defaults a parent can set (e.g. `provideButtonDefaults({ size: 'small' })`).

## Development

```bash
pnpm storybook        # from the repo root; builds dependencies first
pnpm --filter @wingbrace/glideslope test
pnpm --filter @wingbrace/glideslope typecheck
pnpm --filter @wingbrace/glideslope build
```

Read the [component authoring guide](./AUTHORING.md) before adding or changing a component.
