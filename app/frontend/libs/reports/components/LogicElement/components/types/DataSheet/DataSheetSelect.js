import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppStore from 'rb/store/AppStore'
import css from './DataSheet.scss'

export default class DataSheetSelect extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  selectDataSheet = (e) => {
    const name = e.currentTarget.value
    const { condition } = this.props
    condition.type = ''
    condition.answer = name
    this.sync(condition)
  }

  sync = (condition) => {
    const { onChange } = this.props
    onChange(condition)
  }

  render () {
    const { condition } = this.props
    const fields = AppStore.report.dataSheetColumns
    return (
      <div className={css.datasheetSelect}>
        <select
          className="form-control"
          placeholder="Select Factor..."
          value={condition.answer || ''}
          onChange={this.selectDataSheet}
        >
          {!condition.subject && <option />}
          {_.map(fields, (field, i) => (
            <option key={i} value={field.name}>
              {field.name}
            </option>
          ))}
        </select>
      </div>
    )
  }
}
