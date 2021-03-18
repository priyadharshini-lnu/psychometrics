import React from 'react'
import ReactDOM from 'react-dom'
import ReportBuilder from 'modules/reports'
import initSentry from 'libs/initSentry'

import 'modules/reports/styles/ant.less'
import 'styles/utils.scss'

initSentry()

const ID = window.reportDomElementId || 'psychometrics_report_root'
ReactDOM.render(<ReportBuilder />, document.getElementById(ID))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
