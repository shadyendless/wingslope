import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-themes', '@storybook/addon-a11y'],
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
