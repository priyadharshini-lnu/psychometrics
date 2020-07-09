import _ from 'lodash'
import React, { Component } from 'react'
import Select from 'react-select'
import AppStore from 'rb/store/AppStore'
import { getValue } from 'rb/presenters/ReactSelectPresenter'

class DataSheet extends Component {
  getOptions = () => {
    const { onlyNumbers } = this.props
    if (onlyNumbers) {
      return AppStore.report.dataSheetColumns.filter(column => column.type === 'Number')
    }
    return AppStore.report.dataSheetColumns
  }

  onChange = (data) => {
    const { model, singleChoice, onSelect } = this.props
    model.props.source.columns = singleChoice ? [data.name] : data.map(f => f.name)
    onSelect()
  }

  getValue () {
    const { model, singleChoice } = this.props
    const columns = _.result(model, 'props.source.columns', 'Choose Column')
    return singleChoice ? columns[0] || '' : columns
  }

  render () {
    const { singleChoice } = this.props
    return (
      <Select
        name="form-field-name"
        value={getValue(this.getOptions(), this.getValue())}
        getOptionValue={opt => opt.name}
        getOptionLabel={opt => opt.name}
        options={this.getOptions()}
        clearable={false}
        autoFocus={false}
        isMulti={!singleChoice}
        onChange={this.onChange}
      />
    )
  }
}

export default DataSheet
