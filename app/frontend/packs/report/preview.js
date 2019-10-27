import React from 'react'
import ReactDOM from 'react-dom'
import ReportPreview from 'reports-ui/preview'

const ID = window.reportPreviewDomElementId || 'report_preview'
ReactDOM.render(<ReportPreview />, document.getElementById(ID))
