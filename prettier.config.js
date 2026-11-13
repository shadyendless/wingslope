/** @type {import('prettier').Config} */
export default {
  singleQuote: true,
  semi: false,
  trailingComma: 'all',
  printWidth: 100,
  plugins: ['prettier-plugin-tailwindcss'],
  // Lets the Tailwind plugin sort classes inside `@apply` using the Glideslope theme.
  tailwindStylesheet: './packages/foundation/src/index.css',
}
