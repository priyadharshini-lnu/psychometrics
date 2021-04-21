import AssessorApp from 'modules/admin/modules/AssessorApp/App'
import ReactDOM from 'react-dom'
import React from 'react'

import initSentry from 'libs/initSentry'

import 'modules/admin/styles/ant.less'
import 'modules/admin/styles/common.scss'
import 'styles/utils.scss'

initSentry()
ReactDOM.render(<AssessorApp />, document.getElementById('assessor-app-container'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
