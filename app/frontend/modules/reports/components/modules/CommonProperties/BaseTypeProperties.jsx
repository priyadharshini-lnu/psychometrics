import { Component } from 'react'
import _ from 'lodash'
import Select from 'react-select'
import {
  DATA_SHEET, REPORT_DATA, ASSESSMENT_DATA, CAMPAIGN_FACTORS,
} from '~/modules/reports/models/Module'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'

const { I18n } = window

const getOptions = () => [
  { label: I18n.t('administration.report_settings.data_source_types.assessment'), value: ASSESSMENT_DATA },
  { label: I18n.t('administration.report_settings.data_source_types.datasheet'), value: DATA_SHEET },
  { label: I18n.t('administration.report_settings.data_source_types.campaign_factors'), value: CAMPAIGN_FACTORS },
  { label: I18n.t('administration.report_settings.data_source_types.report_data'), value: REPORT_DATA },
].filter(Boolean)

class BaseTypeProperties extends Component {
  onChange = ({ value }) => {
    const { model, onSelect } = this.props
    model.props.source = {
      type: value,
    }

    onSelect()
  }

  getSelectValue = (model, options) => {
    const value = getValue(options, _.get(model, ['props', 'source', 'type']))

    return value || options[0]
  }

  render () {
    const { model } = this.props
    const options = getOptions()

    return (
      <div>
        <Select
          name="form-field-name"
          value={this.getSelectValue(model, options)}
          options={options}
          isClearable={false}
          autoFocus={false}
          onChange={this.onChange}
        />
      </div>
    )
  }
}

export default BaseTypeProperties
