/* eslint-disable no-underscore-dangle */
const { resolve } = require('path')
const { env } = require('process')

const __PROD__ = env.NODE_ENV === 'production'

module.exports.withModules = {
  test: /\.less$/i,
  exclude: /node_modules|ant\.less/,
  use: [
    { loader: 'style-loader' },
    {
      loader: 'css-loader',
      options: {
        sourceMap: true,
        modules: true,
        localIdentName: __PROD__ ? '[hash:base64:5]' : '[name]__[local]___[hash:base64:5]',
      },
    },
    {
      loader: 'postcss-loader',
      options: { config: { path: resolve() }, sourceMap: true },
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
  include: /node_modules|ant\.less/,
  use: [
    { loader: 'style-loader' },
    {
      loader: 'css-loader',
      options: {
        sourceMap: true,
      },
    },
    {
      loader: 'postcss-loader',
      options: { config: { path: resolve() }, sourceMap: true },
    },
    {
      loader: 'less-loader',
      options: { javascriptEnabled: true },
    },
  ],
}
