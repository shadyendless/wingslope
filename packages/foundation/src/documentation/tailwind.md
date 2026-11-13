# Styling with Tailwind

Glideslope uses [Tailwind CSS v4](https://tailwindcss.com/docs/styling-with-utility-classes) as its styling engine, with a deliberately opinionated way of using it. This guide covers those opinions.

## Two places styles live

| Where                                    | What goes there                        | Cascade layer             |
| ---------------------------------------- | -------------------------------------- | ------------------------- |
| A component family's `styles.module.css` | Every style a reusable component needs | `components.l1` … `l5`    |
| Utility classes in an app template       | One-off tweaks in app/feature code     | `utilities` (always wins) |

Reusable components never use inline utility classes. Apps use utility classes freely to adjust components for a specific screen.

## CSS Modules for reusable components

Each component family has one `styles.module.css`, shared by every SFC in the family (e.g. `GsButton`, `GsLinkButton` and `GsToggleButton` share `button/styles.module.css`). The SFC imports it in `<script setup>`:

```vue
<script setup lang="ts">
import styles from './styles.module.css'

const { variant = 'filled', size = 'medium' } = defineProps<{
  variant?: 'filled' | 'flat'
  size?: 'small' | 'medium'
}>()
</script>

<template>
  <button :class="[styles.button, styles[variant]]" :data-size="size"><slot /></button>
</template>
```

```css
/* styles.module.css */
@reference '@wingbrace/glideslope-foundation/styles';

@layer components.l1 {
  .button {
    @apply p-s fg-primary-bold;

    @variant size-small {
      @apply p-xs;
    }

    @variant disabled {
      @apply cursor-not-allowed fg-disabled;
    }
  }
}
```

**Why a separate file and not `<style module>` or `<style scoped>` in the SFC?**

- A family shares one stylesheet. Scoped styles get a per-SFC scope id, so sharing would duplicate the CSS.
- Module classes can be handed to child components (e.g. `GsHero` styles the `GsIcon` inside it), which scoped styles can only reach through `:deep()`.
- `@tailwindcss/vite` does not process inline `<style module>` blocks (`@apply` is left untouched), while an external `.module.css` file is processed normally.
- It keeps templates about structure and behavior, and keeps styles reusable.

### Cascade layers

The foundation declares this layer order:

```
theme, base, components, components.l1 … components.l5, utilities
```

- A first-level component uses `components.l1`.
- A component that restyles another component uses the next layer up. For example, `GsHero` changes the size of `GsIcon` (which lives in `l1`), so those rules go in `components.l2`.
- Utility classes live in `utilities`, above every component layer, so `<GsButton class="rounded-none">` always wins without `!important` or specificity tricks.

### State and prop variants

Write states with `@variant` blocks inside the module, not as inline variant classes. Inside a module, rules apply in the order you write them, so you control which state wins (for example, `disabled` written last beats `hover`).

The foundation's variants are generated from [`variants.json`](../variants/variants.json). Every one is wrapped in `:where()` so it adds no specificity, which is what makes source order decide.

| Kind               | Variants                                                                            | Matches                                                                   |
| ------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Component props    | `size-*`, `color-*`, `elevation-*`, `layout-*`, `orientation-*`                     | `data-size`, `data-color`, … set by the component                         |
| Floating placement | `side-*`, `align-*`                                                                 | `data-side` / `data-align` set by Reka UI poppers                         |
| Interaction        | `hover`, `focus`, `focus-visible`, `focus-within`, `focus-visible-within`, `active` | Native pseudo-classes                                                     |
| Open / selected    | `open`, `closed`, `expanded`, `checked`, `indeterminate`, `selected`, `highlighted` | Reka UI's `data-state` / `data-highlighted`, ARIA, and native equivalents |
| Form state         | `disabled`, `enabled`, `required`, `invalid`, `read-only`, `placeholder-shown`      | Native, ARIA, and Reka UI's `data-disabled` / `data-invalid`              |
| Theme              | `dark`, `light`                                                                     | `.dark` / `.light` or `data-theme` on an ancestor                         |

See [Reka UI's styling guide](https://reka-ui.com/docs/guides/styling) for the data attributes each primitive exposes. When a component has its own state worth styling, expose it as a `data-*` attribute and either style it locally in the module (`&[data-empty]`) or, if several components share it, add a variant to `variants.json`.

## Semantics first

Use semantic tokens, which communicate intent and switch with the theme:

```html
<!-- Ok when prototyping or for rare edge cases: a raw primitive -->
<div class="bg-neutral-300" />

<!-- Good: a semantic token -->
<div class="gap-m bg-surface-raised" />
```

Colors come from the `bg-*`, `fg-*`, `icon-*` and `outline-*` utilities, all of which accept an opacity modifier (`bg-surface-raised/50`). `fg-*` also sets the color of nested icons; `icon-*` sets only the icon color.

When the system lacks a token you need, raise it with design rather than working around it. Gaps are signals for the system to grow.

## Unsupported

**Arbitrary values.** Use theme values instead.

```html
<div class="gap-[11px]" />
<!-- Bad -->
<div class="gap-(--spacing-xxl)" />
<!-- Ok, if no utility exists -->
<div class="gap-xxl" />
<!-- Good -->
```

**Hard-coded values that match the theme.** Reference the theme variable: `[--my-size:var(--typography-size-body-m)]`, not `[--my-size:14px]`.

**Arbitrary variants** such as `data-[size=large]:`. Use a named variant or a dynamic class.

**Selectors that reach into other components** (`[&_span]:pl-s`). Pass a class to the element you want to style instead.

## Dynamic classes

Use Vue's array and object class syntax. No helper library is needed.

```vue
<!-- Bad -->
<div :class="`foo ${disabled ? 'bar' : ''}`" />

<!-- Good -->
<div :class="[styles.foo, { [styles.bar]: disabled }]" />
```

Classes a consumer puts on a component are merged onto its root element automatically (attribute fallthrough), so components do not need a `class` prop.

## Borders are outlines

Glideslope draws borders with `outline` (offset `-1px`) so that a border never changes an element's size. Elements with and without a border line up. Use `outline`, not `border`.
