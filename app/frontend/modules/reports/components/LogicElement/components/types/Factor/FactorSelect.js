import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import css from './Factor.scss'

export default class FactorSelect extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
    questions: PropTypes.array.isRequired,
    factors: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  getQuestions () {
    const { questions } = this.props
    return _.filter(questions, { type: 'MultipleChoice' })
  }

  selectFactor = (e) => {
    const id = e.currentTarget.value
    const { condition } = this.props
    condition.type = ''
    condition.answer = id
    this.sync(condition)
  }

  sync = (condition) => {
    const { onChange } = this.props
    onChange(condition)
  }

  render () {
    const { condition, factors } = this.props
    return (
      <div className={css.factorSelect}>
        <select
          className="form-control"
          placeholder="Select Factor..."
          value={condition.answer || ''}
          onChange={this.selectFactor}
        >
          {!condition.subject && <option />}
          {_.map(factors, factor => <option key={factor.id} value={factor.id}>{factor.name}</option>)}
        </select>
      </div>
    )
  }
}
