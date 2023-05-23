import _ from 'lodash'
import { Component } from 'react'
import QuestionCondition from '~/modules/survey/models/QuestionCondition'
import Condition from './Condition'

export class ConditionList extends Component {
  addCondition = () => {
    const { validation, question } = this.props
    const model = new QuestionCondition({ prefix: 'And', subject: question.id })
    validation.conditions.push(model)
    this.forceUpdate()
  }

  removeCondition = (condition) => {
    const { validation } = this.props
    _.pull(validation.conditions, condition)
    if (validation.conditions.length === 1) {
      validation.conditions[0].prefix = null
    }
    this.forceUpdate()
  }

  render () {
    const {
      validation, question, questions,
    } = this.props
    return (
      <div style={{ margin: '20px 0' }}>
        {_.map(validation.conditions, (condition, id) => (
          <Condition
            validation={validation}
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
