import React, { Component } from 'react'
import PropTypes from 'prop-types'
import QuestionCondition from 'libs/conditions'

export class Question extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
  }

  changeQuestionCondition = (cond) => {
    const { condition } = this.props
    condition.setData(cond)
    this.forceUpdate()
  }

  render () {
    const { questions, condition } = this.props
    return (
      <QuestionCondition
        questions={questions}
        onChange={this.changeQuestionCondition}
        condition={condition}
      />
    )
  }
}

export default Question
