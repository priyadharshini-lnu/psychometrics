import _ from 'lodash'
import React, { Component } from 'react'
import Select from 'react-select'
import { getValue } from 'rb/presenters/ReactSelectPresenter'

class BaseExternalFactor extends Component {
  getOptions = () => {
    const { assessment, sourceType } = this.props
    assessment.factors.filter(f => f.type === sourceType)
  }

  onChange = (data) => {
    const { model, onSelect, singleChoice } = this.props
    model.props.source.factors = singleChoice ? [data.id] : data.map(f => f.id)
    onSelect()
  }

  getValue () {
    const { model, singleChoice } = this.props
    const factors = _.result(model, 'props.source.factors', 'Choose factor')
    return singleChoice ? factors[0] || '' : factors
  }

  render () {
    const { singleChoice } = this.props
    return (
      <Select
        name="form-field-name"
        value={getValue(this.getOptions(), this.getValue())}
        options={this.getOptions()}
        getOptionValue={opt => opt.id}
        getOptionLabel={opt => opt.name}
        isClearable={false}
        autoFocus={false}
        isMulti={!singleChoice}
        onChange={this.onChange}
      />
    )
  }
}

export default BaseExternalFactor
