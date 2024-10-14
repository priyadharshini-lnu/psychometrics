import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import FlowCondition from '~/modules/survey/models/FlowCondition'
import styles from './Branch.less'
import Condition from './Condition'

class ConditionList extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    safeFirstElement: PropTypes.bool,
    onRemove: PropTypes.func,
  }

  addCondition = () => {
    const { model, onUpdate } = this.props
    onUpdate({
      ...model,
      props: { ...model.props, conditions: [...model.props.conditions, new FlowCondition({ prefix: 'And' })] },
    })
  }

  removeCondition = (condition) => {
    const { model, onRemove, onUpdate } = this.props
    const newConditions = model.props.conditions.filter(c => c !== condition)

    if (newConditions.length === 1) {
      newConditions[0] = { ...newConditions[0], prefix: null }
    }

    onUpdate({
      ...model,
      props: { ...model.props, conditions: newConditions },
    })
    if (newConditions.length === 0) {
      onRemove()
    }

    this.forceUpdate()
  }

  render () {
    const { model, safeFirstElement, onUpdate } = this.props
    const { conditions } = model.props
    return (
      <div className={styles.logicList}>
        {_.map(conditions, (condition, i) => (
          <Condition
            key={i}
            index={i}
            model={model}
            condition={condition}
            onAdd={this.addCondition}
            onRemove={this.removeCondition}
            onUpdate={onUpdate}
            disableRemove={safeFirstElement && i === 0 && model.props.conditions.length === 1}
          />
        ))}
      </div>
    )
  }
}

export default ConditionList
