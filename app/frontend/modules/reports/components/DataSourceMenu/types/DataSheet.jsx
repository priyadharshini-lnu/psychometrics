import _ from 'lodash'
import { useSelector } from 'react-redux'
import DataSourceOptionsDropdown from './DataSourceOptionsDropdown'

const DataSheet = ({
  modules, singleChoice, onSelect, onlyNumbers,
}) => {
  const columns = useSelector(state => state.report.builder.data_sheet_columns)

  const onChange = (data) => {
    const model = modules[0]
    model.props.source.columns = singleChoice ? [data.value] : data.map(dataObject => dataObject.value)
    onSelect()
  }

  const getOptions = () => {
    if (onlyNumbers) {
      return columns.filter(column => column.type === 'Number')
        .map(d => ({ label: d.name, value: d.name }))
    }
    return columns.map(d => ({ label: d.name, value: d.name }))
  }

  const getValue = () => {
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

  return (
    <DataSourceOptionsDropdown
      name="form-field-name"
      value={getValue()}
      options={getOptions()}
      clearable={false}
      autoFocus={false}
      isMulti={!singleChoice}
      onChange={onChange}
      placeholder={singleChoice ? 'Choose Column' : 'Choose Columns'}
    />
  )
}

export default DataSheet
