const config = require('../../.eslintrc.js');

config.parserOptions = {
    ecmaVersion: 9,
    sourceType: "module",
    ecmaFeatures: {
        modules: true
    }
};

config.globals = {
    window: true,
    document: true,
    gtag: true
};

// const config = {
//     extends: ['airbnb-base', 'prettier', 'plugin:jest/recommended'],
//     env: {
//         node: true
//     },
//     // overwrite airbnb-base to use commonjs instead of ES6 modules
//     parserOptions: {
//         ecmaVersion: 9,
//         sourceType: "scripts",
//         ecmaFeatures: {
//             modules: false
//         }
//     },
//     globals = {
//         window: true,
//         document: true,
//         gtag: true
//     },
//     rules: {
//         'prettier/prettier': ['error'],
//         'linebreak-style': ['error', process.platform === 'win32' ? 'windows' : 'unix'],
//         'curly': ['error', 'all'],
//         'jest/expect-expect': ['error'],
//         // https://github.com/eslint/eslint/issues/8953#issuecomment-317697474
//         strict: ['error', 'safe']
//     },
//     plugins: ['prettier']
// };

module.exports = config;