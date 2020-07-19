import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TextCondition from 'rb/models/TextCondition'
import styles from './CPIFactorConditionModal.scss'
import Condition from './Condition'

class ConditionList extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    onRemove: PropTypes.func,
  }

  addCondition = () => {
    const { model } = this.props
    model.conditions.push(new TextCondition({ type: 'Scoring', props: { prefix: 'And' } }))
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
    const { model } = this.props
    const { conditions } = model
    return (
      <div className={styles.logicList}>
        {_.map(conditions, (condition, i) => (
          <Condition
            key={i}
            model={model}
            condition={condition}
            onAdd={this.addCondition}
            onRemove={this.removeCondition}
            disableRemove={i === 0 && model.conditions.length === 1}
          />
        ))}
      </div>
    )
  }
}

export default ConditionList
