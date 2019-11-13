import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppStore from 'rb/store/AppStore'
import css from '../Condition.scss'

export default class DataSheet extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
  }

  renderCondition () {
    const { condition: { answer, value, predicate } } = this.props
    const field = _.find(AppStore.report.dataSheetColumns, { name: answer })

    return (
      <div>
        [
        {field ? field.name : 'Undefined'}
        {' '}
        <b>is</b>
        {' '}
        {predicate}
        {' '}
        {value}
        ]
      </div>
    )
  }

  render () {
    return (
      <div className={`${css.preview} ${css.question}`}>
        {this.renderCondition()}
      </div>
    )
  }
}
