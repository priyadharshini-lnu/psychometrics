import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import PropertyPanelStore from '~/modules/reports/store/PropertyPanelStore'
import AssessmentProperties from '~/modules/reports/components/modules/CommonProperties/AssessmentProperties'
import panelStyles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'

export default class DataSourceMenu extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
  }

  onSelect = () => {
    const { onSelect } = this.props
    onSelect()
    PropertyPanelStore.update()
  }

  getSourceTypes = () => [
    { value: 'Question', label: 'Question' },
    { value: 'Factor', label: 'Factors' },
  ]

  changeAssessment = (assessmentId) => {
    const { model } = this.props
    model.assessment_id = assessmentId
    this.onSelect()
  }

  changeSourceType = (value) => {
    const { model } = this.props
    model.props.sourceType = value.value
    this.onSelect()
  }

  render () {
    const { model } = this.props

    return (
      <div>
        <hr className={panelStyles.divider} />
        <div>
          <AssessmentProperties assessmentId={model.assessment_id} changeAssessment={this.changeAssessment} />
          <span>Data Source</span>
          <Select
            name="form-field-name"
            value={getValue(this.getSourceTypes(), _.result(model, 'props.sourceType', 'Choose type'))}
            options={this.getSourceTypes()}
            isClearable={false}
            autoFocus={false}
            onChange={this.changeSourceType}
          />
        </div>
      </div>
    )
  }
}
