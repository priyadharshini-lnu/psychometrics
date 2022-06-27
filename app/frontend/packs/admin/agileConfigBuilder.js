import AgileConfigBuilder from 'modules/admin/modules/AgileConfigBuilder/App'
import ReactDOM from 'react-dom'
import React from 'react'
import 'styles/ant.less'
import 'modules/admin/styles/common.less'
import initSentry from 'libs/initSentry'

initSentry()

/* eslint no-underscore-dangle: 0 */
ReactDOM.render(<AgileConfigBuilder {...window.__PROPS__} />, document.getElementById('agile-config-builder'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
