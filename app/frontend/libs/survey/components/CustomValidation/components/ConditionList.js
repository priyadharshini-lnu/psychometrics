import _ from 'lodash'
import React, { Component } from 'react'
import QuestionCondition from 'models/QuestionCondition'
import Condition from './Condition'

export class ConditionList extends Component {
  addCondition = () => {
    const { question } = this.props
    const model = new QuestionCondition({ prefix: 'And', subject: question.id })
    question.validation.args.conditions.push(model)
    this.forceUpdate()
  }

  removeCondition = (condition) => {
    const { question } = this.props
    _.pull(question.validation.args.conditions, condition)
    if (question.validation.args.conditions.length === 1) {
      question.validation.args.conditions[0].prefix = null
    }
    this.forceUpdate()
  }

  render () {
    const { questions, question } = this.props
    return (
      <div style={{ margin: '20px 0' }}>
        {_.map(question.validation.args.conditions, (condition, id) => (
          <Condition
            questions={questions}
            question={question}
            key={id}
            condition={condition}
            onAdd={this.addCondition}
            onRemove={this.removeCondition}
          />
        ))}
      </div>
    )
  }
}

export default ConditionList
