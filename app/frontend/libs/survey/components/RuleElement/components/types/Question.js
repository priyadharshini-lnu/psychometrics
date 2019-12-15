import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppStore from 'store/AppStore'
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
    const { model } = this.props
    return (
      <QuestionCondition
        questions={AppStore.questions}
        onChange={this.changeQuestionCondition}
        condition={model}
      />
    )
  }
}

export default Question
