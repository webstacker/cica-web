const config = {
    parserOptions: {
        sourceType: "scripts",
        ecmaFeatures: {
            modules: false
        }
    },
    globals: {
        window: true,
        document: true,
        gtag: true
    }
}

module.exports = config;