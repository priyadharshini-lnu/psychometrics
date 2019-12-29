import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import RuleCondition from 'models/RuleCondition'
import Condition from './Condition'

class ConditionList extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    onRemove: PropTypes.func,
  }

  addCondition = () => {
    const { model } = this.props
    const rule = new RuleCondition({ conditionType: 'Hris', prefix: 'And' })
    model.conditions.push(rule)
    this.forceUpdate()
  }

  removeCondition = (condition) => {
    const { model, onRemove } = this.props
    _.pull(model.conditions, condition)
    if (model.conditions.length === 1) {
      model.conditions[0].prefix = null
    }
    if (model.conditions.length === 0) {
      onRemove()
    }
    this.forceUpdate()
  }

  render () {
    const { model, questions } = this.props
    const { conditions } = model
    return (
      <div>
        {_.map(conditions, (condition, i) => (
          <Condition
            key={i}
            model={model}
            condition={condition}
            onAdd={this.addCondition}
            onRemove={this.removeCondition}
            questions={questions}
            disableRemove={i === 0 && model.conditions.length === 1}
          />
        ))}
      </div>
    )
  }
}

export default ConditionList
