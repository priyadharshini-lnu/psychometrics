const fs = require('fs')
const path = require('path')

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const environment = require('./environment')

function getCerts (host) {
  const keyPath = path.resolve(__dirname, `../../support/dev-ssl/${host}.key`)
  const certPath = path.resolve(__dirname, `../../support/dev-ssl/${host}.pem`)
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  }
}

const { config } = environment
const sslCert = getCerts(config.devServer.host)
if (config.devServer.https === true && sslCert) {
  config.merge({
    devServer: {
      https: {
        ...sslCert,
      },
    },
  })
}

module.exports = environment.toWebpackConfig()
