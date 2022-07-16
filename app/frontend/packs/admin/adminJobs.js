import App from 'modules/admin/modules/AdminJob/App'
import ReactDOM from 'react-dom'
import React from 'react'
import 'styles/ant.less'
import 'modules/admin/styles/common.less'
import initSentry from 'libs/initSentry'

initSentry()
/* eslint no-underscore-dangle: 0 */
ReactDOM.render(<App />, document.getElementById('admin-job-wrapper'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
