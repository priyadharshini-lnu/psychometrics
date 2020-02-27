const fs = require('fs')
const path = require('path')

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const environment = require('./environment')

environment.config.merge({
  devServer: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../../support/dev-ssl/dev.key')),
      cert: fs.readFileSync(path.resolve(__dirname, '../../support/dev-ssl/dev-cert.pem')),
    },
  },
})

module.exports = environment.toWebpackConfig()
