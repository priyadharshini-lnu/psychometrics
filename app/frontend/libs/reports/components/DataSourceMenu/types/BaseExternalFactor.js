import _ from 'lodash'
import React, { Component } from 'react'
import Select from 'react-select'
import { getValue } from 'rb/presenters/ReactSelectPresenter'

class BaseExternalFactor extends Component {
  getOptions = () => {
    const { assessment, sourceType } = this.props
    return assessment.factors.filter(f => f.type === sourceType)
  }

  onChange = (data) => {
    const { model, onSelect, singleChoice } = this.props
    model.props.source.factors = singleChoice ? data && [data.id] : data && data.map(f => f.id)
    onSelect()
  }

  render () {
    const { model, singleChoice } = this.props
    const options = this.getOptions()
    const values = _.result(model, 'props.source.factors') || []
    const value = singleChoice ? { id: values[0] } : values.map(f => ({ id: f }))

    return (
      <Select
        name="form-field-name"
        value={getValue(this.getOptions(), value)}
        options={options}
        getOptionValue={opt => opt.id}
        getOptionLabel={opt => (_.find(options, opt) || {}).name}
        isClearable={false}
        autoFocus={false}
        isMulti={!singleChoice}
        onChange={this.onChange}
      />
    )
  }
}

export default BaseExternalFactor
