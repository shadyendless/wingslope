# Glideslope

Glideslope is a Vue 3 design system: design tokens and a Tailwind CSS v4 foundation, Vue components built on [Reka UI](https://reka-ui.com), and an icon set.

## Packages

| Package                                                     | What it is                                                                                                            |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [`@wingbrace/glideslope-foundation`](./packages/foundation) | Tokens, Tailwind theme, variants and utilities. No framework dependency.                                              |
| [`@wingbrace/glideslope`](./packages/glideslope)            | Vue 3 components and composables                                                                                      |
| [`@wingbrace/glideslope-icons`](./packages/icons)           | 259 icons as Vue components                                                                                           |
| [`@wingbrace/geo`](./packages/geo)                          | Coordinate parsing, formatting and conversion (DD, DDM, DMS, MGRS, UTM) and geodesy helpers. No framework dependency. |
| [`apps/playground`](./apps/playground)                      | A plain Vue SPA consuming the built packages, the way a real app would                                                |

## Getting started

Requires Node 22.18+ (24 recommended, see `.nvmrc`) and pnpm 10. The repo is a [Vite+](https://viteplus.dev) project. Its `vp` CLI comes with the `vite-plus` dev dependency: the pnpm scripts below call it, and `vp …` commands run as `pnpm exec vp …`, or as plain `vp …` once the [global CLI](https://viteplus.dev/guide/global-cli) is installed. `pnpm install` also sets up a pre-commit hook that runs `vp check --fix` on staged files.

```bash
pnpm install        # or: vp install
pnpm build          # or: vp run build (foundation, icons and geo, then components and the playground)
pnpm storybook      # or: vp run storybook (http://localhost:6006, builds what it needs first)
pnpm playground     # or: vp run playground (http://localhost:5173, builds what it needs first)
```

| Command          | Does                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| `pnpm build`     | Builds every package in dependency order                                  |
| `pnpm check`     | `vp check`: Oxfmt format check, Oxlint and a TypeScript 7 type check      |
| `pnpm typecheck` | `vue-tsc` / `tsc` (TypeScript 6) across the workspace, templates included |
| `pnpm test`      | Vitest, through `vp test`, across the workspace                           |
| `pnpm lint`      | Oxlint only (`vp lint`)                                                   |
| `pnpm format`    | Oxfmt (`vp fmt`), with Tailwind class sorting                             |
| `pnpm verify`    | Build, check, typecheck and test, as CI would                             |

Each `pnpm <script>` is also `vp run <script>`. Vite+'s built-in commands work from the root too:

- `vp check`, `vp lint`, `vp fmt` and `vp test` cover the whole workspace. `vp test` runs each package with its own Vitest config.
- `vp dev` and `vp preview` serve the playground, the only app. Build the packages first, since it consumes their `dist`.
- `vp build` asks which package to build (`vp -C packages/glideslope build` names one); `vp run build` builds them all.

Inside a package, `vp build` is its whole build, declarations and generated sources included, and `vp test` runs its tests. The library's dev server is Storybook (`vp run storybook`); `vp dev` there has no page to serve. `vp pack` (tsdown) isn't used: the packages build with Vite's library mode, and `vp pack` would clear their `dist`.

## Stack

- **Vue 3.5:** `<script setup>`, reactive props destructure, `defineModel`, typed slots.
- **TypeScript 6.0:** TypeScript 7 (the native compiler) has no JS API yet, which `vue-tsc` requires. Move to 7 once Vue's language tools support it. `vp check` already type-checks with TypeScript 7, which reads `.vue` imports through a loose shim (`src/env.d.ts`), so `vue-tsc` remains the full type check.
- **Reka UI 2:** accessible primitives.
- **Tailwind CSS 4:** components are styled with CSS Modules in cascade layers.
- **Vite+ 1.6:** Vite 8 (its `vite-plus-core` build) for library builds, Storybook and the playground; Vitest, Oxlint and Oxfmt behind one `vp` CLI, configured in the root `vite.config.ts`.
- **Storybook 10:** with `vue-component-meta` docs, theme switching and a11y checks.
- **Testing and linting:** Vitest with Testing Library, Oxlint (including its Vue and type-aware rules) and Oxfmt. Oxlint reads only the `<script>` blocks of `.vue` files, so template mistakes are caught by `vue-tsc`, the Vue compiler and the story render test.

## Docs

- [Styling with Tailwind](./packages/foundation/src/documentation/tailwind.md)
- [Component authoring guide](./packages/glideslope/AUTHORING.md)
- [Design tokens](./packages/foundation/src/tokens/README.md) and [variants](./packages/foundation/src/variants/README.md)
