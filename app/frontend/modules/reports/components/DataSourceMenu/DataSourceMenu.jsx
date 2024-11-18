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

const ChartsMenu = ({
  modules, onSelect, singleChoice, onlyNumbers, dataConfiguration,
}) => {
  const model = modules[0]

  const handleSelect = () => {
    onSelect()
    PropertyPanelStore.update()
  }

  const updateAll = (cb) => {
    modules.forEach((module) => {
      cb(module)
      module.update()
    })
  }

  const getSourceTypes = () => {
    const { assessment_id: assessmentId } = model
    const { category } = AppStore.getAssessmentById(assessmentId)
    return _.filter(SOURCE_TYPES[category], type => !!model.canShowDataSet(type.value, category))
  }

  const getDataConfigurationOptions = () => dataConfiguration.map(d => ({ label: d.label || d.id, value: d.id }))

  const changeAssessment = (assessmentId) => {
    updateAll((item) => {
      item.assessment_id = assessmentId
      clearAfterAssessmentChange(item)
    })
    onSelect()
  }

  const changeSourceType = (value) => {
    updateAll((item) => {
      item.props.source = {
        type: value.value,
      }
    })
    handleSelect()
  }

  const changeReportDataColumns = (value) => {
    updateAll((item) => {
      item.props.source.reportDataColumns = value || []
    })
    handleSelect()
  }

  const renderSettingsBasedOnAssessment = () => {
    if (!model.isBasedOnAssessment()) return null
    return (
      <div>
        <AssessmentProperties assessmentId={model.assessment_id} changeAssessment={changeAssessment} />
        <span className={styles.label}>Data Source</span>
        <Select
          name="form-field-name"
          value={getValue(getSourceTypes(), _.result(model, 'props.source.type', 'Choose type'))}
          getOptionValue={opt => opt.value}
          options={getSourceTypes()}
          isClearable={false}
          autoFocus={false}
          onChange={changeSourceType}
        />
      </div>
    )
  }

  const renderSettingsBasedOnReportData = () => {
    if (!model.isBasedOnReportData()) return null
    return (
      <div>
        <span className={styles.label}>Data Configuration</span>
        <Select
          name="form-field-name"
          value={_.result(model, 'props.source.reportDataColumns', 'Choose')}
          isMulti={model.type === 'Graph'}
          getOptionValue={opt => opt.value}
          options={getDataConfigurationOptions()}
          isClearable={false}
          autoFocus={false}
          onChange={changeReportDataColumns}
        />
      </div>
    )
  }

  const sourceType = _.get(model, 'props.source.type')
  const TypeComponent = types[sourceType]
  const assessment = AppStore.getAssessmentById(model.assessment_id)

  return (
    <div>
      <hr className={panelStyles.divider} />
      <BaseTypeProperties model={model} onSelect={handleSelect} />
      {renderSettingsBasedOnAssessment()}
      {renderSettingsBasedOnReportData()}
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

ChartsMenu.propTypes = {
  onSelect: PropTypes.func.isRequired,
  singleChoice: PropTypes.bool,
  onlyNumbers: PropTypes.bool,
  dataConfiguration: PropTypes.array.isRequired,
}

export default ChartsMenu
