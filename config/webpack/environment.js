const { environment } = require('@rails/webpacker');
const { env } = require('process');
const webpack = require('webpack');
const merge = require('webpack-merge');

const __DEV__ = env.RAILS_ENV === 'development';
const __TEST__ = env.RAILS_ENV === 'test';
const __PROD__ = env.RAILS_ENV === 'production';

environment.plugins.insert(
  'DefinePlugin',
  new webpack.DefinePlugin(Object.assign({
    __DEV__,
    __TEST__,
    __PROD__,
  })),
);

const myCssLoaderOptions = {
  modules: true,
  localIdentName: env.RAILS_ENV === 'production' ? '[hash:base64:5]' : '[name]__[local]___[hash:base64:5]',
};

const CSSLoader = environment.loaders.get('sass').use.find(el => el.loader === 'css-loader');
CSSLoader.options = merge(CSSLoader.options, myCssLoaderOptions);

module.exports = environment;
