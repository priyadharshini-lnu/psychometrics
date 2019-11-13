import React, { Component } from 'react'
import PropTypes from 'prop-types'
import css from './Condition.scss'
import { Previews } from './types'

export default class ConditionListPreview extends Component {
  static propTypes = {
    conditions: PropTypes.array.isRequired,
    oneCondition: PropTypes.bool.isRequired,
  }

  renderLogicType (condition) {
    const { conditions, oneCondition } = this.props
    const first = condition === conditions[0]
    if (first) {
      if (!oneCondition) { return null }
      return (
        <span className={`${css.keyword} ${css.highlight}`}>if</span>
      )
    }
    return (
      <span className={css.highlight}>{condition.prefix}</span>
    )
  }

  renderConditionType (condition) {
    const type = condition.conditionType
    const View = Previews[type]
    return <View condition={condition} />
  }

  renderConditionTypeSelect (condition) {
    return (
      <span className={css.mute}>
[
        {condition.conditionType}
]
      </span>
    )
  }

  render () {
    const { conditions, oneCondition } = this.props
    return (
      <div className={css.conditionPreview}>
        {conditions.map((condition, i) => (
          <div key={i} className={`${css.condition} ${oneCondition ? '' : css.shift}`}>
            {this.renderLogicType(condition)}
            {this.renderConditionTypeSelect(condition)}
            {this.renderConditionType(condition)}
          </div>
        ))}
      </div>
    )
  }
}
