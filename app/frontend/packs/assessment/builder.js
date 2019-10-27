import React from 'react'
import ReactDOM from 'react-dom'
import Assessment from 'survey-ui'

const ID = window.assessmentDomElementId || 'psychometrics_survey_root'
ReactDOM.render(<Assessment />, document.getElementById(ID))
