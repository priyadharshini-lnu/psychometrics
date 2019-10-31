import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppStore from 'store/AppStore'
import QuestionCondition from 'psychometrics-conditions-ui'

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
    const { condition } = this.props
    return (
      <QuestionCondition
        questions={AppStore.questions}
        onChange={this.changeQuestionCondition}
        condition={condition}
      />
    )
  }
}

export default Question
