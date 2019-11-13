import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import css from './QuestionCondition.scss'
import Input from './Input'

const TYPES = {
  Mean: 'Mean',
  RespondentsCount: 'Respondents Count',
  Sum: 'Sum',
  Minimum: 'Minimum',
  Maximum: 'Maximum',
}

export default class ConditionSelect extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  sync = (condition) => {
    const { onChange } = this.props
    onChange(condition)
  }

  changeType = (e) => {
    const { condition } = this.props
    const { value } = e.currentTarget
    condition.type = value
    this.sync(condition)
  }

  render () {
    const { condition } = this.props

    if (!condition.answer) {
      return <div className={css.predicates} />
    }

    return (
      <div className={css.condition}>
        <select
          className={`form-control ${css.typeSelect}`}
          placeholder="Select Type..."
          value={condition.type || ''}
          onChange={this.changeType}
        >
          <option />
          {_.map(TYPES, (value, key) => <option key={key} value={key}>{value}</option>)}
        </select>
        <span className={css.keyword}>is</span>
        <Input {...this.props} />
      </div>
    )
  }
}
