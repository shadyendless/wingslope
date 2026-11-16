# Glideslope

Glideslope is a Vue 3 design system: design tokens and a Tailwind CSS v4 foundation, Vue components built on [Reka UI](https://reka-ui.com), and an icon set.

It reimplements the Accelint design system ([`standard-toolkit`](https://github.com/gohypergiant/standard-toolkit) `design-foundation` and `design-toolkit`) for Vue, keeping its tokens, Tailwind approach and component designs.

## Packages

| Package                                                     | What it is                                                                                                                                                |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@wingbrace/glideslope-foundation`](./packages/foundation) | Tokens, Tailwind theme, variants and utilities. No framework dependency.                                                                                  |
| [`@wingbrace/glideslope`](./packages/glideslope)            | Vue 3 components and composables                                                                                                                          |
| [`@wingbrace/glideslope-icons`](./packages/icons)           | 259 icons as Vue components                                                                                                                               |
| [`@wingbrace/geo`](./packages/geo)                          | Coordinate parsing, formatting and conversion (DD, DDM, DMS, MGRS, UTM) and geodesy helpers. No framework dependency. Began as a copy of `@accelint/geo`. |
| [`apps/playground`](./apps/playground)                      | A plain Vue SPA consuming the built packages, the way a real app would                                                                                    |

## Getting started

Requires Node 22.12+ (24 recommended, see `.nvmrc`) and pnpm 10.

```bash
pnpm install
pnpm build          # foundation, icons, then components
pnpm storybook      # http://localhost:6006
pnpm playground     # http://localhost:5173 (run `pnpm build` first)
```

| Command          | Does                                     |
| ---------------- | ---------------------------------------- |
| `pnpm build`     | Builds every package in dependency order |
| `pnpm typecheck` | `vue-tsc` / `tsc` across the workspace   |
| `pnpm test`      | Vitest across the workspace              |
| `pnpm lint`      | ESLint (with `eslint-plugin-vue`)        |
| `pnpm format`    | Prettier (with Tailwind class sorting)   |
| `pnpm verify`    | All of the above, as CI would            |

## Stack

- **Vue 3.5:** `<script setup>`, reactive props destructure, `defineModel`, typed slots.
- **TypeScript 6.0:** TypeScript 7 (the native compiler) has no JS API yet, which `vue-tsc` requires. Move to 7 once Vue's language tools support it.
- **Reka UI 2:** accessible primitives.
- **Tailwind CSS 4:** components are styled with CSS Modules in cascade layers.
- **Vite 8:** library builds, Storybook and the playground.
- **Storybook 10:** with `vue-component-meta` docs, theme switching and a11y checks.
- **Testing and linting:** Vitest with Testing Library, then ESLint, `eslint-plugin-vue` and Prettier.

## Docs

- [Styling with Tailwind](./packages/foundation/src/documentation/tailwind.md)
- [Component authoring guide](./packages/glideslope/AUTHORING.md)
- [Design tokens](./packages/foundation/src/tokens/README.md) and [variants](./packages/foundation/src/variants/README.md)
