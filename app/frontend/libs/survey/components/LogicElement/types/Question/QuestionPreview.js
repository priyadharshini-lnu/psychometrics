import React from 'react'
import PropTypes from 'prop-types'
import QuestionCondition from 'libs/conditions'

const QuestionPreview = ({ condition, questions }) => (
  <QuestionCondition
    preview
    questions={questions}
    condition={condition}
  />
)

QuestionPreview.propTypes = {
  condition: PropTypes.object.isRequired,
}

export default QuestionPreview
