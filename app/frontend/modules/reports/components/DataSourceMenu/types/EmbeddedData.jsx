import _ from 'lodash'
import { Component } from 'react'
import Select from 'react-select'
import { connect } from 'react-redux'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import { getEmbeddedData } from '~/modules/reports/core/builder/selectors'

class EmbeddedData extends Component {
  onChange = (data) => {
    const { modules, onSelect } = this.props
    modules.forEach((module) => {
      module.props.source.name = data.name
    })
    onSelect()
  }

  getOptions = () => {
    const { embeddedData } = this.props
    return embeddedData
  }

  render () {
    const { modules: [model] } = this.props
    return (
      <Select
        name="form-field-name"
        value={getValue(this.getOptions(), _.result(model, 'props.source.name', 'Choose data'))}
        options={this.getOptions()}
        getOptionValue={opt => opt.value}
        isClearable={false}
        autoFocus={false}
        onChange={this.onChange}
      />
    )
  }
}

export default connect((state, { modules: [model] }) => ({
  embeddedData: getEmbeddedData(state.report, model.assessment_id),
}), {})(EmbeddedData)
