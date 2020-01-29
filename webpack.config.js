const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './build/module/index.js',
    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        filename: 'omoearth.js'
    },
    devServer: {
        contentBase: './dist'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin([
            { from: 'build/module/quants/*.js', to: 'quants/', flatten: true },
            { from: 'src/index.html' },
        ])
    ],
};