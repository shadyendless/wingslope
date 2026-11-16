/* oxlint-disable typescript/no-explicit-any -- the real component types come from vue-tsc */
// Added by `vp migrate`, then loosened. `vp check` type-checks with TypeScript 7, which can't read
// Vue single-file components yet, so there each `.vue` import is a component taking any props and
// slots, and any type argument (for generic components such as `GsTable<T>`). vue-tsc (TypeScript 6)
// resolves the real `.vue` files before falling back to this, so `typecheck` and the declaration
// build still check each component's own props, emits and slots.
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent &
    (new <T = any>(...args: any) => { $props: any; $slots: any; $emit: any })
  export default component
}
