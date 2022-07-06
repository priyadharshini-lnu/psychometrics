import React from 'react'
import ReactDOM from 'react-dom'

import 'styles/ant.less'
import 'modules/admin/styles/common.less'
import 'styles/utils.less'

import initSentry from 'libs/initSentry'

import DatasheetManagementApp from 'modules/admin/modules/DatasheetManagement/App'

initSentry()

ReactDOM.render(
  <DatasheetManagementApp />,
  document.getElementById('datasheet-management-container'),
)

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
