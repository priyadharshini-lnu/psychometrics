import React from 'react'
import ReactDOM from 'react-dom'
import PassAssessment from 'survey-ui/preview'

const ID = window.assessmentPreviewDomElementId || 'psychometrics_preview'
ReactDOM.render(<PassAssessment />, document.getElementById(ID))
