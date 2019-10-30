import React from 'react'
import ReactDOM from 'react-dom'
import ReportPreview from 'libs/reports/preview'

const ID = window.reportPreviewDomElementId || 'report_preview'
ReactDOM.render(<ReportPreview />, document.getElementById(ID))
