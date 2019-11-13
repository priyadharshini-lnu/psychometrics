import React from 'react'
import ReactDOM from 'react-dom'
import PassAssessment from 'libs/survey/containers/PreviewContainer'

const ID = window.assessmentPreviewDomElementId || 'psychometrics_preview'
ReactDOM.render(<PassAssessment />, document.getElementById(ID))
