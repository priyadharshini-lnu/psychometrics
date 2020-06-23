import React, { Component } from 'react'
import PropTypes from 'prop-types'
import css from './DataSheet.scss'
import Input from './Input'

export default class ConditionSelect extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  sync = (condition) => {
    const { onChange } = this.props
    onChange(condition)
  }

  render () {
    const { condition } = this.props

    if (!condition.subject) {
      return <div className={css.predicates} />
    }

    return (
      <div className={css.condition}>
        <span className={css.keyword}>is</span>
        <Input {...this.props} />
      </div>
    )
  }
}
