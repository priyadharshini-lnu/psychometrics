import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import css from './DataSheet.less'

export default class DataSheetSelect extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  selectDataSheet = (e) => {
    const name = e.currentTarget.value
    const { condition } = this.props
    condition.type = ''
    condition.subject = name
    this.sync(condition)
  }

  sync = (condition) => {
    const { onChange } = this.props
    onChange(condition)
  }

  render () {
    const { dataSheetColumns, condition } = this.props

    return (
      <div className={css.datasheetSelect}>
        <select
          className="form-control"
          placeholder="Select..."
          value={condition.subject || ''}
          onChange={this.selectDataSheet}
        >
          {!condition.subject && <option />}
          {_.map(dataSheetColumns, (field, i) => (
            <option key={i} value={field.name}>
              {field.name}
            </option>
          ))}
        </select>
      </div>
    )
  }
}
