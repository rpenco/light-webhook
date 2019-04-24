const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const PermissionsOutputPlugin = require('webpack-permissions-plugin');

module.exports = {
    entry: './src/index.js',
    mode: 'production',
    target: "node",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js'
    },
    plugins: [
        new CopyPlugin([
            { from: './src/light-webhook', to: './'}
        ]),
        new PermissionsOutputPlugin({
            buildFiles: [
                {
                    path: path.resolve(__dirname, 'dist/light-webhook'),
                    fileMode: '777'
                }
            ]
        })
    ],
};