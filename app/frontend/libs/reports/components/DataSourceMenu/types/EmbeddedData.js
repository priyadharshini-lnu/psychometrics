import _ from 'lodash'
import React, { Component } from 'react'
import Select from 'react-select'
import AssessmentStore from 'rb/store/AssessmentStore'
import { getValue } from 'rb/presenters/ReactSelectPresenter'

class EmbeddedData extends Component {
  getOptions = () => {
    const { model } = this.props
    return AssessmentStore.embeddedData[model.assessment_id]
  }

  onChange = (data) => {
    const { model, onSelect } = this.props
    model.props.source.name = data.name
    onSelect()
  }

  render () {
    const { model } = this.props
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

export default EmbeddedData
