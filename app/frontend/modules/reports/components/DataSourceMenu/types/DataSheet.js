import _ from 'lodash'
import React, { Component } from 'react'
import Select from 'react-select'
import AppStore from 'modules/reports/store/AppStore'

class DataSheet extends Component {
  onChange = (data) => {
    const { model, singleChoice, onSelect } = this.props
    model.props.source.columns = singleChoice ? [data] : data
    onSelect()
  }

  getOptions = () => {
    const { onlyNumbers } = this.props
    if (onlyNumbers) {
      return AppStore.report.dataSheetColumns.filter(column => column.type === 'Number').map(d => d.name)
    }
    return AppStore.report.dataSheetColumns.map(d => d.name)
  }

  getValue () {
    const { model } = this.props
    return _.result(model, 'props.source.columns', 'Choose Column')
  }

  render () {
    const { singleChoice } = this.props
    return (
      <Select
        name="form-field-name"
        value={this.getValue()}
        getOptionValue={opt => opt}
        getOptionLabel={opt => opt}
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
