import React from 'react'
import ReactDOM from 'react-dom'

import 'modules/admin/styles/ant.less'
import 'modules/admin/styles/common.scss'
import 'styles/utils.scss'

import ClientApp from 'modules/admin/modules/client/App'
import initSentry from 'libs/initSentry'

initSentry()
ReactDOM.render(<ClientApp />, document.getElementById('client-container'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
