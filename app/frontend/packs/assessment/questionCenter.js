import React from 'react'
import ReactDOM from 'react-dom'
import QuestionCenterContainer from 'libs/survey/containers/QuestionCenterContainer'

const ID = window.questionCenterDomElementId || 'psychometrics_question_center'
ReactDOM.render(<QuestionCenterContainer />, document.getElementById(ID))
