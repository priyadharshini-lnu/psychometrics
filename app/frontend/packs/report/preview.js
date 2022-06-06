import React from 'react'
import ReactDOM from 'react-dom'
import ReportPreview from 'modules/reports/preview'
import initSentry from 'libs/initSentry'

import 'styles/ant.js'
import 'styles/utils.less'

initSentry()

const ID = window.reportPreviewDomElementId || 'report_preview'
ReactDOM.render(<ReportPreview />, document.getElementById(ID))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
