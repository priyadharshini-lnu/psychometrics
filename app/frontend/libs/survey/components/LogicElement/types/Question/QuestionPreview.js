import React from 'react'
import PropTypes from 'prop-types'
import store from 'store/AppStore'
import QuestionCondition from 'libs/conditions'

const QuestionPreview = ({ condition }) => (
  <QuestionCondition
    preview
    questions={store.questions}
    condition={condition}
  />
)

QuestionPreview.propTypes = {
  condition: PropTypes.object.isRequired,
}

export default QuestionPreview
