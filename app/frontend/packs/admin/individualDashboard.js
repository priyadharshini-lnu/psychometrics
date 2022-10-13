import React from 'react'
import ReactDOM from 'react-dom'

import 'styles/ant.less'
import 'modules/admin/styles/common.less'
import 'styles/utils.less'

import { App as IndividualDashboard } from 'modules/admin/modules/IndividualDashboard/App'
import initSentry from 'libs/initSentry'

initSentry()
ReactDOM.render(<IndividualDashboard />, document.getElementById('individual-dashboard-container'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
