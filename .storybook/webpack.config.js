const path = require('path')
const appConfig = require('../config/webpack/environment')

// Export a function. Accept the base config as the only param.
module.exports = async ({ config, mode }) => {
  // `mode` has a value of 'DEVELOPMENT' or 'PRODUCTION'
  // You can change the configuration based on that.
  // 'PRODUCTION' is used when building the static version of storybook.
const lessRule = appConfig.loaders.find(loader=> loader.key==='less').value
const lessGlobalsRule = appConfig.loaders.find(loader=> loader.key==='lessGlobals').value
const miniCssExtractPlugin = appConfig.plugins.find(plugin=> plugin.key==='MiniCssExtract').value
  // Make whatever fine-grained changes you need
  config.module.rules.push(lessRule,lessGlobalsRule)
  config.plugins.push(miniCssExtractPlugin)

  // Return the altered config
  return config
}
