const config = {
    parserOptions: {
        sourceType: "module",
        ecmaFeatures: {
            modules: true
        }
    },
    globals: {
        window: true,
        document: true,
        gtag: true
    }
}

module.exports = config;