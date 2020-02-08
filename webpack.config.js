const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './build/module/index.js',
    // entry: './src/index.ts',
    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        filename: 'omoearth.js'
    },
    devServer: {
        contentBase: './dist'
        // ,port: 8081
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin([
            { from: 'build/module/quants/*.js', to: 'quants/', flatten: true },
            // { from: 'build/module/quants/*.ts', to: 'quants/', flatten: true },
            // { from: 'build/module/quants/*.map', to: 'quants/', flatten: true },
            { from: 'src/index.html' },
        ])
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
            }
        ]
    }
    // module: {
    //     rules: [
    //         {
    //             test: /\.ts?$/,
    //             use: 'ts-loader',
    //             exclude: /node_modules/,
    //         },
    //     ],
    // },
    // resolve: {
    //     extensions: ['.ts']
    // },
};