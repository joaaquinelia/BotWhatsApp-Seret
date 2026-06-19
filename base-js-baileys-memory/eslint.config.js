import builderbot from 'eslint-plugin-builderbot'

export default [
    {
        ignores: ['dist/**', 'node_modules/**', 'rollup.config.js'],
    },
    {
        plugins: {
            builderbot,
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        rules: {
            ...builderbot.configs.recommended.rules,
            'builderbot/func-prefix-endflow-flowdynamic': 'off',
            'builderbot/func-prefix-end-flow-return': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            'no-unsafe-optional-chaining': 'off',
        },
    },
]
