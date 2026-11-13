# AGENTS.md

Durable, repo-specific instructions for coding agents. Project facts live in [README.md](./README.md) and the docs it links.

## Before changing code

- Read [`packages/glideslope/AUTHORING.md`](./packages/glideslope/AUTHORING.md) before adding or changing a component, and [`packages/foundation/src/documentation/tailwind.md`](./packages/foundation/src/documentation/tailwind.md) before writing styles.
- When porting a component from `standard-toolkit/packages/design-toolkit`, port its behavior and styles, but use Vue and Reka UI idioms rather than mirroring the React or react-aria API. Do not reintroduce react-aria-specific variants or attributes.
- Port a component's Storybook stories and `*.docs.mdx` page with it: same sidebar title, story names and order as the Design Toolkit's, one Glideslope story file per Design Toolkit story file (see AUTHORING's "Tests and stories").

## Hard-won constraints

- **TypeScript stays on 6.0.x.** TypeScript 7 has no JS API, and `vue-tsc` fails to start with it.
- **Component styles go in an external `styles.module.css` imported in `<script setup>`.** `@tailwindcss/vite` does not process inline `<style module>` blocks; `@apply` comes out untouched.
- **State variants must stay zero-specificity (`:where()`).** Do not style components with Tailwind's built-in `hover` / `active` / `focus` variants, or they will override later `disabled` rules. Use the foundation's variants, which redefine them.
- **The library CSS must start with the layer-order statement** (`src/styles/layers.css`, imported first in `src/index.ts`). It must match the foundation's `@layer` statement.
- **Generated files** (`packages/foundation/src/tokens/{tokens.css,themes.css,types.ts,index.ts}`, `variants.css`, and `packages/icons/src/icons/*`, `packages/icons/src/index.ts`) are never edited by hand. Edit the JSON or SVG and run the package's `generate` script.
- **Named groups in CSS Modules depend on `build/postcss-global-groups.js`.** It is registered in both `vite.config.ts` and `.storybook/vite.config.ts`. Keep both in sync, or `group-*/name` variants silently stop matching.
- **Do not set `unmountOnHide: false` on a Reka combobox inside a portal.** Reka's `hideOthers()` then marks the open list `aria-hidden`. `GsOptionRegistry` exists to get option labels without that.
- **Inputs that buffer typed text need a local draft.** Vue resets an `<input>`'s DOM value to its bound `:value` on any re-render. See the slider inputs.
- **A Vite or Storybook config change needs a dev server restart.** HMR doesn't pick those up, and a stale server shows misleading story-index errors.

## Workflow

- Use `pnpm` only. Run scripts through the root or package `package.json`.
- Packages consume each other's `dist`, so run `pnpm build` before Storybook, the playground, or a downstream typecheck.
- Before calling work done, run `pnpm verify` (build, typecheck, test, lint, format check), and for UI changes check both themes in Storybook.
- Ask before adding dependencies, changing public exports, or changing shared configs (`tsconfig.base.json`, `eslint.config.js`, `pnpm-workspace.yaml`).
- Do not commit or push unless asked.
- Commit messages follow [`.gitmessage`](./.gitmessage) (the standard-toolkit template):
  - Title: `<label>: Summary` with label `build`, `chore`, `docs`, `feat`, `fix` or `refactor`, an imperative summary starting upper case, at most 50 characters, no period.
  - Body: wrapped at 72 characters, explaining what and why.
  - Never add AI attribution such as `Co-Authored-By` trailers or "Generated with" lines.
