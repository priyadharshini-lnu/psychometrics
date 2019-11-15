import React, { Component } from 'react'
import PropTypes from 'prop-types'
import store from 'rb/store/AssessmentStore'
import QuestionCondition from 'libs/conditions'

export class Question extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    condition: PropTypes.object.isRequired,
  }

  changeQuestionCondition = (props) => {
    const { condition } = this.props
    condition.setProps(props)
    this.forceUpdate()
  }

  render () {
    const { model, condition } = this.props
    const assessmentId = model.module.assessment_id
    return (
      <QuestionCondition
        questions={store.questions[assessmentId]}
        onChange={this.changeQuestionCondition}
        condition={condition.props}
      />
    )
  }
}

export default Question
