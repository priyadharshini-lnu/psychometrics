import _ from 'lodash'
import { Component } from 'react'
import Select from 'react-select'
import AppStore from '~/modules/reports/store/AppStore'

class CampaignFactors extends Component {
  onChange = (data) => {
    const { model, singleChoice, onSelect } = this.props
    model.props.source.codes = singleChoice ? [data.value] : data.map(dataObject => dataObject.value)
    onSelect()
  }

  getOptions = () => {
    const { onlyNumbers } = this.props
    if (onlyNumbers) {
      return AppStore.report.campaignFactors.filter(code => code.outputType === 'numeric')
        .map(d => ({ label: d.name, value: d.code }))
    }
    return AppStore.report.campaignFactors.map(d => ({ label: d.name, value: d.code }))
  }

  getValue () {
    const { model, singleChoice } = this.props
    if (singleChoice) {
      const resultingValue = _.result(model, 'props.source.codes.0')
      return {
        value: resultingValue,
        label: resultingValue,
      }
    }

    return _.result(model, 'props.source.codes', []).map(value => ({ label: value, value }))
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
        placeholder={singleChoice ? 'Choose Factor' : 'Choose Factors'}
      />
    )
  }
}

export default CampaignFactors
