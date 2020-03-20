'use strict';

const config = {
    testRegex: '.*\\.test\\.jsdom\\.js$'
};

config.coverageThreshold = {
    global: {
        branches: 50,
        functions: 50,
        lines: 50,
        statements: 50
    }
};

module.exports = config;
