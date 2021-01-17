import DatasheetManagementApp from 'modules/admin/modules/DatasheetManagement/App'
import ReactDOM from 'react-dom'
import React from 'react'
import 'modules/admin/styles/ant.less'
import 'modules/admin/styles/common.scss'
import 'styles/utils.scss'
import initSentry from 'libs/initSentry'

initSentry()
ReactDOM.render(<DatasheetManagementApp />, document.getElementById('datasheet-management-container'))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
