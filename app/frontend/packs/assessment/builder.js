import React from 'react'
import ReactDOM from 'react-dom'
import Assessment from 'modules/survey/containers/AppContainer'
import initSentry from 'libs/initSentry'

initSentry()

const ID = window.assessmentDomElementId || 'psychometrics_survey_root'
ReactDOM.render(<Assessment />, document.getElementById(ID))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
