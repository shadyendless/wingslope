/**
 * Options for `@vitejs/plugin-vue`, shared by the library build, Storybook and Vitest so they
 * compile templates the same way.
 *
 * media-chrome's elements (`<media-controller>`, `<media-play-button>`, …) are web components:
 * Vue must render them as custom elements rather than resolve them as Vue components.
 */
export const vueOptions = {
  template: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('media-'),
    },
  },
}
