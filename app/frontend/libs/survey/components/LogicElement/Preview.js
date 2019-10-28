import React, { Component } from 'react'
import PropTypes from 'prop-types'
import css from './Condition.scss'
import ConditionListPreview from './ConditionListPreview'

export default class LogicElementPreview extends Component {
  static propTypes = {
    logic: PropTypes.object.isRequired,
  }

  renderLogicType (list) {
    const { logic: { conditions } } = this.props
    if (conditions.length < 2) { return null }
    const first = list === conditions[0]
    if (first) {
      return (
        <span className={`${css.keyword} ${css.top}`}>if</span>
      )
    }
    return (
      <span className={`${css.highlight} ${css.top}`}>{list.prefix}</span>
    )
  }

  render () {
    const { logic: { conditions } } = this.props
    return (
      <div className={css.conditionPreviews}>
        {conditions.map((list, i) => (
          <div key={i} className={css.listItem}>
            {this.renderLogicType(list)}
            <ConditionListPreview
              conditions={list.conditions}
              oneCondition={conditions.length === 1}
            />
          </div>
        ))}
      </div>
    )
  }
}
