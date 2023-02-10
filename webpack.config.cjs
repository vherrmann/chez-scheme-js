const path = require('path');

/** @type {import('webpack').Configuration} */
const config = {
    mode: 'development',
    entry: './src/index.ts',
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            }
        ],
    },
};

const esmConfig = {
    ...config,
    target: 'web',
    experiments: {
        outputModule: true,
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        module: true,
        libraryTarget: 'module',
    },
    resolve: {
        alias: {
            path: false,
            fs: false,
            crypto: false,
            child_process: false,
        }
    },
};

module.exports = esmConfig;