import React from 'react'
import 'admin/styles/ant.less'
import ReactDOM from 'react-dom'
import Assessment from 'libs/survey/containers/AppContainer'

const ID = window.assessmentDomElementId || 'psychometrics_survey_root'
ReactDOM.render(<Assessment />, document.getElementById(ID))
