import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TextCondition from 'rb/models/TextCondition'
import styles from './ConditionalTextModal.scss'
import Condition from './Condition'

class ConditionList extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  addCondition = () => {
    const { model } = this.props
    model.conditions.push(new TextCondition({ props: { prefix: 'And' } }, model))
    this.forceUpdate()
  }

  removeCondition = (condition) => {
    const { model: { conditions } } = this.props
    _.pull(conditions, condition)
    if (conditions.length === 1) {
      conditions[0].prefix = 'And'
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
