/* eslint-disable no-underscore-dangle */
const { resolve } = require('path')
const { env } = require('process')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const __PROD__ = env.NODE_ENV === 'production'

module.exports.withModules = {
  test: /\.less$/i,
  exclude: /node_modules|ant\.less|globals\.less/,
  use: [
    __PROD__ ? MiniCssExtractPlugin.loader : { loader: 'style-loader' },
    {
      loader: 'css-loader',
      options: {
        sourceMap: !__PROD__,
        modules: true,
        localIdentName: __PROD__ ? '[hash:base64:5]' : '[name]__[local]___[hash:base64:5]',
      },
    },
    {
      loader: 'postcss-loader',
      options: { sourceMap: !__PROD__ },
    },
    {
      loader: 'less-loader',
      options: { javascriptEnabled: true, paths: [resolve(__dirname, '../../..', 'app/frontend')] },
    },
  ],
  sideEffects: true,
}

module.exports.withoutModules = {
  test: /\.less$/i,
  include: /node_modules|ant\.less|globals\.less/,
  use: [
    __PROD__ ? MiniCssExtractPlugin.loader : { loader: 'style-loader' },
    {
      loader: 'css-loader',
      options: {
        sourceMap: !__PROD__,
      },
    },
    {
      loader: 'postcss-loader',
      options: { sourceMap: !__PROD__ },
    },
    {
      loader: 'less-loader',
      options: {
        paths: [
          resolve(__dirname, '../../..', 'app/frontend'),
        ],
        javascriptEnabled: true,
      },
    },
  ],
  sideEffects: false,
}
