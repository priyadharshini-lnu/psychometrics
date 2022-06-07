import React from 'react'
import ReactDOM from 'react-dom'

import 'styles/ant.js'
import 'modules/admin/styles/common.less'
import 'styles/utils.less'

import ClientApp from 'modules/admin/modules/client/App'
import initSentry from 'libs/initSentry'

initSentry()
ReactDOM.render(<ClientApp />, document.getElementById('client-container'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
