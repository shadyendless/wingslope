# Custom variants

[`variants.json`](./variants.json) is the source of truth for Glideslope's Tailwind custom variants. `pnpm generate` turns each entry into `@custom-variant name (&:where(selector))` in `variants.css`.

```json
{
  "side-top": "[data-side=\"top\"]",
  "hover": { "media": "(hover: hover)", "selector": ":hover" }
}
```

An entry is either a selector list, or `{ media, selector }` to also require a media query.

## Rules

- **Order is priority.** Entries are listed from lowest to highest priority; later variants win conflicts. Keep `disabled` near the end so it overrides interaction states.
- **Zero specificity.** Every selector is wrapped in `:where()`, so within a CSS Module the order you write `@variant` blocks decides which state wins. This is also why Glideslope redefines `hover`, `focus`, `focus-visible` and `active`: Tailwind's built-in versions carry pseudo-class specificity and would beat a later `@variant disabled`.
- **Match what renders.** State variants combine native pseudo-classes, ARIA attributes, and the data attributes [Reka UI](https://reka-ui.com/docs/guides/styling) emits (`data-state`, `data-highlighted`, `data-disabled`, `data-side`, …).
- **Only shared states belong here.** A state unique to one component should be a local selector in that component's module (e.g. `&[data-empty]`).

`read-only` deliberately excludes `:read-only`, which matches every non-editable element.
