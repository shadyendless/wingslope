import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default defineConfigWithVueTs(
  {
    name: 'glideslope/ignores',
    ignores: [
      '**/dist/**',
      '**/storybook-static/**',
      '**/coverage/**',
      'packages/icons/src/icons/**',
      'packages/foundation/src/tokens/index.ts',
    ],
  },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommendedTypeChecked,
  {
    name: 'glideslope/rules',
    rules: {
      // Glideslope components are prefixed with `Gs` so they are always multi-word.
      'vue/multi-word-component-names': 'error',
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        { registeredComponentsOnly: false, ignores: ['/^[a-z]+$/'] },
      ],
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/define-macros-order': [
        'error',
        { order: ['defineOptions', 'defineProps', 'defineEmits', 'defineModel', 'defineSlots'] },
      ],
      'vue/require-typed-ref': 'error',
      'vue/no-unused-refs': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/no-required-prop-with-default': 'error',
      'vue/require-explicit-slots': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true, varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
    },
  },
  {
    name: 'glideslope/tests',
    files: ['**/*.test.ts'],
    rules: {
      // Tests define small host components inline to exercise provide/inject.
      'vue/one-component-per-file': 'off',
    },
  },
  {
    name: 'glideslope/node-scripts',
    files: ['**/scripts/**/*.{js,mjs,ts}', '**/*.config.{js,mjs,ts}', '.storybook/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
  skipFormatting,
)
