const fs = require('fs')
const path = require('path')
const apiMocker = require('mocker-api')

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

// Adds API Mocker to dev server
if (process.env.NODE_ENV === 'development' && process.env.RUN_MOCK_SERVER) {
  config.merge({
    devServer: {
      before (app) {
        apiMocker(app, path.resolve(__dirname, '../mocker/index.js'), {
          header: {
            'Access-Control-Allow-Origin': 'https://www.lvh.me:3030',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, X-CSRF-Token',
          },
        })
      },
    },
  })
}

module.exports = environment.toWebpackConfig()
