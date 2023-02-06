const path = require('path');

/** @type {import('webpack').Configuration} */
const config = {
    mode: 'development',
    entry: './src/index.ts',
    devtool: 'inline-source-map',
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
        path: path.resolve(__dirname, 'dist/esm'),
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
    }
};

const cjsConfig = {
    ...config,
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist/cjs'),
        libraryTarget: 'commonjs',
    },
    resolve: {
        alias: {
            path: false,
            fs: false,
            crypto: false,
            child_process: false,
        }
    }
}

module.exports = [esmConfig, cjsConfig];