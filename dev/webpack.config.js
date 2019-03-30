const path = require('path');

const config = {
    devtool: 'inline-source-map',
    entry: { index: './src/index.ts' },
    output: { filename: `[name].js` },
    module: {
        rules: [{
            test: /\.ts$/,
            use: [
                { loader: 'ts-loader' }
            ]
        }, {
            test: /\.less$/,
            use: [
                { loader: 'style-loader' },
                { loader: 'css-loader' },
                { loader: 'less-loader' }
            ]
        }]
    },
    resolve: {
        extensions: ['.js', '.ts', '.css', '.less'],
    },
    mode: 'none'
}

module.exports = config;