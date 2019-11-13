import React from 'react'
import store from 'store/AppStore'
import QuestionCondition from 'libs/conditions'

const Question = ({ condition }) => (
  <QuestionCondition
    preview
    questions={store.questions}
    condition={condition}
  />
)

export default Question
