const webpack = require('webpack')
const dotenv = require('dotenv').config({ path: __dirname + '/.env' })
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const path = require('path')

const mode = process.env.NODE_ENV || 'development'
const prod = mode === 'production'
// const CopyPlugin = require('copy-webpack-plugin');

const { mdsvex } = require('mdsvex')

module.exports = {
  entry: {
    bundle: ['./src/index.ts', './src/styles.css'],
  },
  resolve: {
    alias: {
      svelte: path.resolve('node_modules', 'svelte'),
    },
    extensions: ['.mjs', '.tsx', '.ts', '.js', '.svelte', '.svx'],
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
        test: /.(svelte|html|svx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'svelte-loader',
          options: {
            emitCss: true,
            hotReload: true,
            preprocess: mdsvex(),
            preprocess: require('./svelte.config.js').preprocess,
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
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: process.env.NODE_ENV,
  plugins: [
    new ExtractTextPlugin('styles.css', {
      disable: process.env.NODE_ENV === 'development',
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.parsed),
    }),
    // new BundleAnalyzerPlugin(),
    // new CopyPlugin({
    // 	patterns: [
    // 		{ from: 'public', to: '' },
    // 	],
    // }),
  ],
  devtool: prod ? false : 'source-map',
}
