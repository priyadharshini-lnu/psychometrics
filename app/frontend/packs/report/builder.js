import React from 'react'
import ReactDOM from 'react-dom'
import ReportBuilder from 'libs/reports'

const ID = window.reportDomElementId || 'psychometrics_report_root'
ReactDOM.render(<ReportBuilder />, document.getElementById(ID))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
