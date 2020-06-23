import React, { Component } from 'react'
import PropTypes from 'prop-types'
import QuestionCondition from 'libs/conditions'

export class Question extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeQuestionCondition = (condition) => {
    const { model } = this.props
    model.setData(condition)
    this.forceUpdate()
  }

  render () {
    const { model, questions } = this.props
    return (
      <QuestionCondition
        questions={questions}
        onChange={this.changeQuestionCondition}
        condition={model}
      />
    )
  }
}

export default Question
