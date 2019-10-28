import _ from 'lodash'
import React, { Component } from 'react'
import store from 'store/CustomValidationStore'
import QuestionCondition from 'models/QuestionCondition'
import Condition from './Condition'

export class ConditionList extends Component {
  addCondition = () => {
    const model = new QuestionCondition({ prefix: 'And', subject: store.model.id })
    store.model.validation.args.conditions.push(model)
    this.forceUpdate()
  }

  removeCondition = (condition) => {
    _.pull(store.model.validation.args.conditions, condition)
    if (store.model.validation.args.conditions.length === 1) {
      store.model.validation.args.conditions[0].prefix = null
    }
    this.forceUpdate()
  }

  render () {
    const { model } = store
    return (
      <div style={{ margin: '20px 0' }}>
        {_.map(model.validation.args.conditions, (condition, id) => (
          <Condition
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
