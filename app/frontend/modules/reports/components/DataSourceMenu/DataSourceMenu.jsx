import { Component } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import Select from 'react-select'
import PropertyPanelStore from '~/modules/reports/store/PropertyPanelStore'
import AssessmentProperties from '~/modules/reports/components/modules/CommonProperties/AssessmentProperties'
import BaseTypeProperties from '~/modules/reports/components/modules/CommonProperties/BaseTypeProperties'
import clearAfterAssessmentChange from '~/modules/reports/components/modules/CommonMethods/clearAfterAssessmentChange'
import AppStore from '~/modules/reports/store/AppStore'
import { SOURCE_TYPES } from '~/modules/reports/models/Report'
import panelStyles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import types from './types'
import styles from './DataSourceMenu.less'

class ChartsMenu extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    singleChoice: PropTypes.bool,
  }

  onSelect = () => {
    const { onSelect } = this.props
    onSelect()
    PropertyPanelStore.update()
  }

  getSourceTypes = () => {
    const {
      model, model: { assessment_id: assessmentId },
    } = this.props
    const { category } = AppStore.getAssessmentById(assessmentId)
    return _.filter(SOURCE_TYPES[category], type => !!model.canShowDataSet(type.value, category))
  }

  getDataConfigurationOptions () {
    const { dataConfiguration } = this.props
    return dataConfiguration.map(d => ({ label: d.label || d.id, value: d.id }))
  }

  questionSelect = (questions) => {
    const { model } = this.props
    if (_.isArray(questions)) {
      model.props.source.id = questions.map(q => q.value)
    } else {
      model.props.source.id = questions.value
    }
    this.onSelect()
  }

  changeAssessment = (assessmentId) => {
    const { model, onSelect } = this.props
    model.assessment_id = assessmentId

    clearAfterAssessmentChange(model)
    onSelect()
  }

  changeSourceType = (value) => {
    const { model } = this.props
    model.props.source = {
      type: value.value,
    }

    this.onSelect()
  }

  changeReportDataColumns = (value) => {
    const { model } = this.props
    model.props.source.reportDataColumns = value || []

    this.onSelect()
  }

  renderSettingsBasedOnAssessment () {
    const { model } = this.props
    if (!model.isBasedOnAssessment()) return null
    return (
      <div>
        <AssessmentProperties assessmentId={model.assessment_id} changeAssessment={this.changeAssessment} />
        <span className={styles.label}>Data Source</span>
        <Select
          name="form-field-name"
          value={getValue(this.getSourceTypes(), _.result(model, 'props.source.type', 'Choose type'))}
          getOptionValue={opt => opt.value}
          options={this.getSourceTypes()}
          isClearable={false}
          autoFocus={false}
          onChange={this.changeSourceType}
        />
      </div>
    )
  }

  renderSettingsBasedOnReportData () {
    const { model } = this.props
    if (!model.isBasedOnReportData()) return null

    return (
      <div>
        <span className={styles.label}>Data Configuration</span>
        <Select
          name="form-field-name"
          value={_.result(model, 'props.source.reportDataColumns', 'Choose')}
          isMulti={model.type === 'Graph'}
          getOptionValue={opt => opt.value}
          options={this.getDataConfigurationOptions()}
          isClearable={false}
          autoFocus={false}
          onChange={this.changeReportDataColumns}
        />
      </div>
    )
  }

  render () {
    const {
      model, onSelect, singleChoice, onlyNumbers,
    } = this.props

    const sourceType = _.get(model, 'props.source.type')
    const TypeComponent = types[sourceType]
    const assessment = AppStore.getAssessmentById(model.assessment_id)

    return (
      <div>
        <hr className={panelStyles.divider} />
        <BaseTypeProperties model={model} onSelect={this.onSelect} />
        {this.renderSettingsBasedOnAssessment()}
        {this.renderSettingsBasedOnReportData()}
        <div className="margin-top-10">
          {TypeComponent && (
            <TypeComponent
              singleChoice={singleChoice}
              onlyNumbers={onlyNumbers}
              model={model}
              onSelect={onSelect}
              assessment={assessment}
              sourceType={sourceType}
            />
          )}
        </div>
      </div>
    )
  }
}

export default ChartsMenu
