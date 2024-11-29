import _ from 'lodash'
import { Component } from 'react'
import Select from 'react-select'
import AppStore from '~/modules/reports/store/AppStore'

class DataSheet extends Component {
  onChange = (data) => {
    const { model, singleChoice, onSelect } = this.props
    model.props.source.columns = singleChoice ? [data.value] : data.map(dataObject => dataObject.value)
    onSelect()
  }

  getOptions = () => {
    const { onlyNumbers } = this.props
    if (onlyNumbers) {
      return AppStore.report.dataSheetColumns.filter(column => column.type === 'Number')
        .map(d => ({ label: d.name, value: d.name }))
    }
    return AppStore.report.dataSheetColumns.map(d => ({ label: d.name, value: d.name }))
  }

  getValue () {
    const { modules, singleChoice } = this.props
    const model = modules[0]
    if (singleChoice) {
      const resultingValue = _.result(model, 'props.source.columns', [])[0]
      return {
        value: resultingValue,
        label: resultingValue,
      }
    }

    return _.result(model, 'props.source.columns', []).map(value => ({ label: value, value }))
  }

  render () {
    const { singleChoice } = this.props
    return (
      <Select
        name="form-field-name"
        value={this.getValue()}
        options={this.getOptions()}
        clearable={false}
        autoFocus={false}
        isMulti={!singleChoice}
        onChange={this.onChange}
        placeholder={singleChoice ? 'Choose Column' : 'Choose Columns'}
      />
    )
  }
}

export default DataSheet
