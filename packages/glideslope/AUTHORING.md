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
- **Optional booleans that mean something when unset:** Vue casts an absent `boolean` prop to `false`, so `prop ?? fallback` never reaches the fallback. Give such props an explicit `= undefined` default (`GsLabel`'s `required`).
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
- **Controls inside a composite widget's rows** (list and tree row actions) are named out of the row (`aria-labelledby` / `aria-label`), stop clicks from reaching the row, and use `useRowTabStop()` so Tab reaches them only in the row that is the roving tab stop.
- **Module-level state** (the notice queue in `notice/use-notices.ts`) is for state that must be reachable outside components. It is shared across server-side requests, so document it as client-only.
- **Compound components** (List → ListItem): use a typed `InjectionKey` in `context.ts` with `provide…Context` / `inject…Context` helpers. Keep the context internal.
- **One item, several containers:** `GsOption` renders a Reka `ListboxItem`, `SelectItem` or `ComboboxItem` depending on the `OptionsContext.kind` its container provides, and menu items pick Reka's `DropdownMenu*` or `ContextMenu*` parts from `menuParts[kind]` the same way. Reuse this approach rather than adding per-container item components.

## Overlays

Tooltip, popover, dialog and menu share one shape:

- The trigger goes in a `#trigger` slot, rendered inside Reka's `…Trigger as-child`, so it must be a single element or component (usually a `GsButton`). `GsDialog`'s trigger is optional; open it with `v-model:open` instead.
- The default slot is the content and receives `close`.
- **A tooltip overwrites its trigger's `data-state`** with its own (`closed`, `delayed-open`). Reka gives its trigger part precedence, so a toggle, radio or checkbox inside `GsTooltip`'s `#trigger` loses `data-state="on"`/`"checked"`. Style state with the foundation's variants (`selected`, `checked`, `indeterminate`), which also match `aria-pressed` / `aria-checked`, never with raw `[data-state=…]` selectors.
- Overlays set `inheritAttrs: false` and bind `$attrs` to their `…Trigger`. Their root is a fragment (trigger plus portal), so otherwise an outer overlay's trigger attributes and listeners are dropped when one overlay is another's trigger.
- Content is portalled to `body`. Styles reach it through module classes on the Reka content part, not through ancestors in the page.
- Reka labels popover content by its trigger and gives that precedence over attributes we pass, so `GsPopoverTitle` points the panel's `aria-labelledby` at itself after it mounts, and `GsPopover`'s `label` renders a hidden span the panel is labelled by.

## Fields

Labeled form controls share the internal `GsFieldLayout`, which renders Reka UI's `FieldRoot` with `GsLabel`, the control slot, `FieldDescription` and `FieldError`.

- **Shared props** (`label`, `description`, `errorMessage`, `size`, `invalid`, `disabled`, `required`, `name`, `validate`, `validationMode`) come from `GsFieldProps` in `field/types.ts`.
- **Small size:** at `size="small"` the label isn't rendered. The layout passes `ariaLabel` to its slot; put it on the control.
- **Attribute routing:** fields set `inheritAttrs: false` and use `useSplitAttrs()`. `rootAttrs` (class, style) go on the layout; `controlAttrs` go on the control.
- **Native inputs** go through Reka's `FieldControl` (`GsInput` does this inside a field). Reka controls that already join `FieldRoot` (`SelectRoot`, `CheckboxRoot`, `DateFieldRoot`) need nothing extra. Wrap controls that don't (`TimeFieldRoot`) in the internal `GsFieldConnect`.
- **Button-like controls** (select trigger, date segment group) get `:native-label="false"` so the label doesn't forward clicks to them.

## Choice controls

Checkbox, radio and switch use the Reka button (`CheckboxRoot`, `RadioGroupItem`, `SwitchRoot`) as the component root, with the indicator and label text inside it. The whole row is one control, the label is its accessible name, and state attributes (`data-state`, `data-disabled`) sit on the root where `group-*/checkbox` variants expect them. Keep them `<button>`s: Reka relies on native button keyboard handling.

## Styling

Follow the foundation's [styling guide](../foundation/src/documentation/tailwind.md). In short:

- All styles live in the family's `styles.module.css`, starting with `@reference '@wingbrace/glideslope-foundation/styles';`, in `@layer components.l1`. A component that restyles another component uses the next layer up.
- Never use inline style attributes in components or `<style>` blocks in SFCs.
- Express props as `data-*` attributes (`data-size`, `data-color`) styled with `@variant size-large { … }`. Express mutually exclusive visual variants as module classes (`styles[variant]`).
- Use semantic tokens only, and draw borders with `outline`, not `border`.
- **Named groups work inside modules.** Put a literal `group/<name>` class on a component's root and use `@variant group-hover/<name>` (or any `group-*`/`peer-*` variant) in its stylesheet. `build/postcss-global-groups.js` keeps those class names from being hashed. Fields share `group/field` on the field root, which carries `data-size`, `data-invalid` and `data-disabled`.
- **Values that vary per instance** (a marker position, an offset) go in a CSS variable set with `:style`, not typed `attr()`, which isn't supported across browsers.

## Accessibility

Preserve keyboard operation, accessible names, focus behavior and status feedback. Things to check:

- Icon-only buttons need an `aria-label`.
- Decorative elements are `aria-hidden`.
- Disabled links drop their `href`.
- Meaning is never carried by color alone.

## Tests and stories

- **Tests** (`<family>.test.ts`) use Vitest (imported from `vite-plus/test`) with `@testing-library/vue` and `user-event`. Query by role and name, and test behavior: provided defaults, `v-model`, disabled handling, ARIA. CSS Module class names are unhashed in tests (`toHaveClass('button', 'filled')`).
- **Reka wires some things after mount:** label and description IDs, slider thumbs. Use `findBy…` or `waitFor` for those assertions rather than `getBy…` straight after `render`. Don't query with `{ hidden: true }` to make a test pass; a hidden element is usually a real accessibility bug.
- **Stories mirror the Design Toolkit's.** For a ported component, keep one story file per Design Toolkit story file, with the same file name, `title` and story names, in the same order (`Default` is the controls-driven story). Add a story only when it shows Vue-specific API (a `v-model`, a slot, `provide*Defaults`), after the ported ones. Stories are CSF3 with `satisfies Meta<typeof GsX>`; templates may use utility classes for layout.
- **Docs pages** (`<name>.docs.mdx`, next to the stories, `<Meta of={…Stories} />`) follow the Design Toolkit's page with Vue code samples. Use `<ArgTypes>` for props, events and slots, which are generated from the components' JSDoc, rather than hand-written tables.
- **`src/stories.test.ts` renders every story** and fails on Vue warnings. Story templates are strings, so it is the only check that catches an unregistered or misspelled component in one.
- Check every new component in both themes in Storybook, and in `apps/playground` when it affects how consumers use the library.
