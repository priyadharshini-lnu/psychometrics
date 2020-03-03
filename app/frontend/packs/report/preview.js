import React from 'react'
import ReactDOM from 'react-dom'
import ReportPreview from 'libs/reports/preview'

const ID = window.reportPreviewDomElementId || 'report_preview'
ReactDOM.render(<ReportPreview />, document.getElementById(ID))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
