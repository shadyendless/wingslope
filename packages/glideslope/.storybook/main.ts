import type { StorybookConfig } from '@storybook/vue3-vite'
import remarkGfm from 'remark-gfm'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.ts'],
  addons: [
    {
      name: '@storybook/addon-docs',
      // GitHub-flavored Markdown (tables, task lists) in the *.docs.mdx pages, as in the Design Toolkit.
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
    '@storybook/addon-themes',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      // Reads prop, slot and event types plus their JSDoc for the autodocs tables.
      docgen: { plugin: 'vue-component-meta', tsconfig: 'tsconfig.app.json' },
      builder: {
        // The package's own vite.config.ts is a library build; Storybook gets an app config.
        viteConfigPath: '.storybook/vite.config.ts',
      },
    },
  },
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
  docs: {
    defaultName: 'Docs',
  },
}

export default config
