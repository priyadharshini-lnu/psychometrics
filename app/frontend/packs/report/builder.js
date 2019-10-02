import React from 'react'
import ReactDOM from 'react-dom'
import ReportBuilder from 'reports-ui'

const ID = window.reportDomElementId || 'psychometrics_report_root'
ReactDOM.render(<ReportBuilder />, document.getElementById(ID))
