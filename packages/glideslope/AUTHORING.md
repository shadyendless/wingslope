# Component authoring guide

How Glideslope components are built. Follow these conventions for every new component so the library stays consistent.

## Families and files

Components are grouped into **families** under `src/components/<family>/`, with a kebab-case folder name:

```
button/
  GsButton.vue          main component
  GsLinkButton.vue      variant: different element/behavior, same styles
  GsToggleButton.vue    variant
  GsClearButton.vue     internal: not exported from index.ts
  styles.module.css     one stylesheet shared by the family
  types.ts              props and shared types, with JSDoc
  defaults.ts           provide/inject defaults (when parents set this family's defaults)
  context.ts            parent-to-child context (compound components)
  index.ts              the family's public exports
  button.test.ts
  button.stories.ts
```

- **Naming:** components are PascalCase SFCs prefixed with `Gs` (`GsMenuItem.vue`). The prefix keeps every name multi-word, as the Vue style guide requires, and avoids clashes with native elements.
- **Exports:** add the family to `src/index.ts` and export it flat (`GsMenu`, `GsMenuItem`). There is no dot notation.

## Script setup

```vue
<script setup lang="ts">
/** One-paragraph description and an @example. This shows up in Storybook. */
import { Primitive } from 'reka-ui'
import { computed } from 'vue'
import { injectButtonDefaults } from './defaults'
import styles from './styles.module.css'
import type { GsButtonProps } from './types'

const { as = 'button', disabled = false, size, color } = defineProps<GsButtonProps>()

defineSlots<{
  /** What goes in the slot. */
  default?: () => unknown
}>()

const defaults = injectButtonDefaults()
const resolvedSize = computed(() => size ?? defaults.value.size ?? 'medium')
</script>
```

- **Props:** declare them in `types.ts` as an `interface` with JSDoc on every prop (it becomes the Storybook docs), then use reactive props destructure with defaults (`const { x = 1 } = defineProps<…>()`). Use Vue naming: `disabled`, not `isDisabled`.
- **Defaults a parent may provide:** leave props without a default and resolve them as `prop ?? defaults.value.prop ?? fallback`, so an explicit prop beats a provided default, which beats the component default.
- **Two-way state:** use `defineModel()`, so consumers bind with `v-model` and the component still works uncontrolled.
- **Events:** native events (`@click`, `@focus`) fall through to the root element, so don't redeclare them. Declare custom events with `defineEmits<…>()`.
- **Slots:** always declare them with `defineSlots`. Scoped slots replace React render props (`<slot :pressed="pressed" />`).
- **Classes and attributes** from the consumer merge onto the root element automatically, so no `class` prop is needed. For inner parts a consumer may need to style, accept `classes?: { part?: string }`.

## Building on Reka UI

Use the [Reka UI](https://reka-ui.com/docs/overview/introduction) primitive whenever one exists. It provides keyboard interaction, focus management, ARIA and `data-state` attributes. [shadcn-vue](https://www.shadcn-vue.com) is a good reference for wiring Reka parts together; its inline-class styling is not.

- Expose `as` / `asChild` (Reka's `PrimitiveProps`) on components that render a single element, so consumers can render a `RouterLink` or other component.
- Reka emits `data-state`, `data-highlighted`, `data-disabled`, `data-side`, … The foundation's variants (`open`, `selected`, `highlighted`, `disabled`, `side-*`) already match these.

## Sharing state with descendants

- **Defaults for another family** (Button sizing the Icons in it, Avatar placing the Badges in it): use `createDefaults()` in `defaults.ts` and export `provide<Family>Defaults` publicly.
- **Compound components** (List → ListItem): use a typed `InjectionKey` in `context.ts` with `provide…Context` / `inject…Context` helpers. Keep the context internal.

## Styling

Follow the foundation's [styling guide](../foundation/src/documentation/tailwind.md). In short:

- All styles live in the family's `styles.module.css`, starting with `@reference '@wingbrace/glideslope-foundation/styles';`, in `@layer components.l1`. A component that restyles another component uses the next layer up.
- Never use inline style attributes in components or `<style>` blocks in SFCs.
- Express props as `data-*` attributes (`data-size`, `data-color`) styled with `@variant size-large { … }`. Express mutually exclusive visual variants as module classes (`styles[variant]`).
- Use semantic tokens only, and draw borders with `outline`, not `border`.

## Accessibility

Preserve keyboard operation, accessible names, focus behavior and status feedback. Things to check:

- Icon-only buttons need an `aria-label`.
- Decorative elements are `aria-hidden`.
- Disabled links drop their `href`.
- Meaning is never carried by color alone.

## Tests and stories

- **Tests** (`<family>.test.ts`) use Vitest with `@testing-library/vue` and `user-event`. Query by role and name, and test behavior: provided defaults, `v-model`, disabled handling, ARIA. CSS Module class names are unhashed in tests (`toHaveClass('button', 'filled')`).
- **Stories** (`<family>.stories.ts`) are CSF3 with `satisfies Meta<typeof GsX>`. Include a `Playground` story wired to controls, plus stories for meaningful states. Story templates may use utility classes for layout.
- Check every new component in both themes in Storybook, and in `apps/playground` when it affects how consumers use the library.
