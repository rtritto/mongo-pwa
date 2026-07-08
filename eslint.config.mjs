import pluginTypescript from 'typescript-eslint'
import pluginUnicorn from 'eslint-plugin-unicorn'
import pluginSolid from 'eslint-plugin-solid/configs/typescript'
// TODO waiting fix of https://github.com/francoismassart/eslint-plugin-tailwindcss/pull/381
// import pluginTailwindcss from 'eslint-plugin-tailwindcss'

export default pluginTypescript.config(
  ...pluginTypescript.configs.recommended,
  pluginUnicorn.configs.recommended,
  pluginSolid,
  // ...pluginTailwindcss.configs['flat/recommended'],
  {
    rules: {
      'comma-dangle': [1, 'never'],
      'semi': [1, 'never'],

      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-unused-vars': [1, { argsIgnorePattern: '^_' }],

      'unicorn/consistent-boolean-name': 0,
      'unicorn/empty-brace-spaces': 0,
      'unicorn/filename-case': 0,
      'unicorn/max-nested-calls': 0,
      'unicorn/name-replacements': 0,
      'unicorn/no-await-expression-member': 0,
      'unicorn/no-break-in-nested-loop': 0,
      'unicorn/no-computed-property-existence-check': 0,
      'unicorn/no-empty-file': 0,
      'unicorn/no-global-object-property-assignment': 0,
      'unicorn/no-keyword-prefix': 0,
      'unicorn/no-null': 0,
      'unicorn/no-top-level-side-effects': 0,
      'unicorn/numeric-separators-style': 0,
      'unicorn/prefer-early-return': 0,
      'unicorn/prefer-node-protocol': 0,

      'solid/no-innerhtml': 0

      // 'tailwindcss/no-custom-classname': [1, {
      //   whitelist: ['is-active']
      // }]
    }
  }
)
