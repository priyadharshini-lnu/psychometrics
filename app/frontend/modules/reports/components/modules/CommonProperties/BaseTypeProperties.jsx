import { Component } from 'react'
import _ from 'lodash'
import Select from 'react-select'
import {
  DATA_SHEET, REPORT_DATA, ASSESSMENT_DATA, CAMPAIGN_FACTORS,
} from '~/modules/reports/models/Module'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'

const OPTIONS = [
  { label: 'Assessment', value: ASSESSMENT_DATA },
  { label: 'Datasheet', value: DATA_SHEET },
  { label: 'Campaign Factors', value: CAMPAIGN_FACTORS },
  { label: 'Report Data', value: REPORT_DATA },
]
class BaseTypeProperties extends Component {
  onChange = ({ value }) => {
    const { model, onSelect } = this.props
    model.props.source = {
      type: value,
    }

    onSelect()
  }

  getSelectValue = (model) => {
    const value = getValue(OPTIONS, _.get(model, ['props', 'source', 'type']))

    return value || OPTIONS[0]
  }

  render () {
    const { model } = this.props

    return (
      <div>
        <Select
          name="form-field-name"
          value={this.getSelectValue(model)}
          options={OPTIONS}
          isClearable={false}
          autoFocus={false}
          onChange={this.onChange}
        />
      </div>
    )
  }
}

export default BaseTypeProperties
