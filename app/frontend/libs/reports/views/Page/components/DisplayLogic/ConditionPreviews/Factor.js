import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppStore from 'rb/store/AppStore'
import AliasStore from 'rb/store/modals/AliasStore'
import css from '../Condition.scss'

export default class Factor extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
  }

  renderFactor () {
    const { condition: { answer } } = this.props
    const factor = _.find(AliasStore.getFactors(), { id: +answer })

    return <div>{factor ? factor.name : 'Undefined'}</div>
  }

  renderCondition () {
    const { condition: { type, value, predicate } } = this.props

    return (
      <div>
        [
        {type}
        {' '}
        <b>is</b>
        {predicate}
        {' '}
        {value}
        ]
      </div>
    )
  }

  render () {
    const { condition: { filterId } } = this.props
    const filter = _.find(AppStore.report.filters, { id: +filterId })
    return (
      <div className={`${css.preview} ${css.question}`}>
        <div className={css.filter}>
          (
          {filter ? filter.name : 'Unknown'}
          )
        </div>
        {this.renderFactor()}
        {this.renderCondition()}
      </div>
    )
  }
}
