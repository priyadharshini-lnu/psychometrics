import React from 'react'
import ReactDOM from 'react-dom'

import QuestionCenterContainer from 'modules/survey/containers/QuestionCenterContainer'
import initSentry from 'libs/initSentry'

initSentry()

const ID = window.questionCenterDomElementId || 'psychometrics_question_center'
ReactDOM.render(<QuestionCenterContainer />, document.getElementById(ID))

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
