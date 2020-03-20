/*! m0-start */

'use strict';

const config = {
    testEnvironment: 'node'
};
/*! m0-end */

config.setupFilesAfterEnv = ['./jest.setup.js'];

config.coverageThreshold = {
    '*.js': {
        branches: 50,
        functions: 50,
        lines: 50,
        statements: 50
    }
};

/*! m0-start */
module.exports = config;
/*! m0-end */
