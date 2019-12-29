import React from 'react'
import ReactDOM from 'react-dom'
import Assessment from 'libs/survey/containers/AppContainer'

const ID = window.assessmentDomElementId || 'psychometrics_survey_root'
console.log(ID)
ReactDOM.render(<Assessment />, document.getElementById(ID))
