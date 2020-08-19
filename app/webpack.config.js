const ExtractTextPlugin = require('extract-text-webpack-plugin')
const path = require('path')
const webpack = require('webpack')
const dotenv = require('dotenv').config({ path: __dirname + '/.env' })

const mode = process.env.NODE_ENV || 'development'
const IS_DEV = process.env.NODE_ENV === 'development'

module.exports = {
  entry: {
    bundle: ['./src/index.ts', './src/styles.css'],
  },
  resolve: {
    alias: {
      svelte: path.resolve('node_modules', 'svelte'),
    },
    extensions: ['.mjs', '.tsx', '.ts', '.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
  },
  output: {
    path: __dirname + '/public',
    filename: '[name].js',
    chunkFilename: '[name].[id].js',
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: 'svelte-loader',
          options: {
            emitCss: !IS_DEV,
            hotReload: IS_DEV,
            preprocess: require('./svelte.config.js').preprocess,
            customElement: true,
            css: true
          },
        },
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', options: { importLoaders: 1 } },
            'postcss-loader',
          ],
        }),
      },
      {
        test: /\.tsx?$/,
        use: ['ts-loader', 'source-map-loader'],
        //exclude: /node_modules/,
      },
    ],
  },
  mode: process.env.NODE_ENV,
  plugins: [
    new webpack.SourceMapDevToolPlugin({}),

    new ExtractTextPlugin({
      filename: 'styles.css',
      disable: process.env.NODE_ENV === 'development',
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.parsed),
    }),
  ],
  devtool: IS_DEV ? 'source-map' : false,
}
