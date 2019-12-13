const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    mode: 'production',
    target: 'node',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                    ],
                exclude: /node_modules/,
            },

        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
        new CompressionPlugin()],
};