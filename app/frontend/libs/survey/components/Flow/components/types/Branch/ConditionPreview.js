import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './Condition.scss'
import Types from './types'

export class ConditionPreview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    condition: PropTypes.object.isRequired,
  }

  renderLogicType () {
    const { condition, model } = this.props
    const first = condition === model.props.conditions[0]
    if (first) {
      return (
        <span className={`${styles.keyword} ${styles.highlight}`}>if</span>
      )
    }
    return (
      <span className={styles.highlight}>{condition.prefix}</span>
    )
  }

  renderConditionType () {
    const { condition } = this.props
    const type = condition.conditionType
    const View = Types[type].Preview || Types.Question.Preview

    return <View {...this.props} />
  }

  renderConditionTypeSelect () {
    const { condition } = this.props
    return (
      <span className={styles.mute}>
        [
        {condition.conditionType}
        ]
      </span>
    )
  }

  render () {
    return (
      <div className={styles.conditionPreview}>
        {this.renderLogicType()}
        {this.renderConditionTypeSelect()}
        {this.renderConditionType()}
      </div>
    )
  }
}

export default ConditionPreview
