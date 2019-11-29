'use strict';

const path = require('path');

// refer to .babelrc file:
// https://stackoverflow.com/questions/35756479/does-jest-support-es6-import-export

module.exports = {
    entry: {
        app: './src/js/scripts.js'
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public/dist/js')
    },
    devtool: 'none',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                [
                                    '@babel/preset-env',
                                    {
                                        targets:
                                            'last 1 version, ie >= 11, Safari >= 12, > 0.25%, not dead'
                                    }
                                ]
                            ]
                        }
                    }
                ]
            }
        ]
    }
};
