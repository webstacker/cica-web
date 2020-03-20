/*! m0-start */

'use strict';

const config = {
    testEnvironment: 'node'
};
/*! m0-end */

config.setupFilesAfterEnv = ['./jest.setup.js'];

config.coverageThreshold = {
    global: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100
    }
};

/*! m0-start */
module.exports = config;
/*! m0-end */
