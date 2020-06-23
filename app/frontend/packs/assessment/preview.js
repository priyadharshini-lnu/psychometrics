import React from 'react'
import ReactDOM from 'react-dom'
import PreviewAssessment from 'modules/survey/containers/PreviewContainer'

const ID = window.assessmentPreviewDomElementId || 'psychometrics_preview'
ReactDOM.render(<PreviewAssessment />, document.getElementById(ID))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
