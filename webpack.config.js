'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        'bundle.js': [
            // bundles from the bottom up.
            path.resolve(__dirname, 'components/cica/modal/modal.js'),
            path.resolve(__dirname, 'src/js/scripts.js')
        ]
    },
    output: {
        filename: '[name]',
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
                                        useBuiltIns: 'usage',
                                        corejs: 3,
                                        // https://github.com/browserslist/browserslist
                                        targets:
                                            'last 1 version, ie >= 11, Safari >= 12, ios_saf >= 10, iOS >= 10'
                                    }
                                ]
                            ]
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            SERVICE_URL: JSON.stringify(process.env.CW_URL),
            SESSION_DURATION: process.env.CW_SESSION_DURATION
        })
    ]
};
