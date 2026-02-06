import _ from 'lodash'
import PropTypes from 'prop-types'
import Select from 'react-select'
import { Space, Select as AntdSelect, Radio } from 'antd'
import PropertyPanelStore from '~/modules/reports/store/PropertyPanelStore'
import AssessmentProperties from '~/modules/reports/components/modules/CommonProperties/AssessmentProperties'
import BaseTypeProperties from '~/modules/reports/components/modules/CommonProperties/BaseTypeProperties'
import clearAfterAssessmentChange from '~/modules/reports/components/modules/CommonMethods/clearAfterAssessmentChange'
import AppStore from '~/modules/reports/store/AppStore'
import { SOURCE_TYPES } from '~/modules/reports/models/Report'
import panelStyles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import types from './types'
import {
  CUSTOM_FACTOR_VALUE_FIELDS, GRAPH_TYPES_SUPPORTING_CUSTOM_FACTOR_FIELDS,
} from '~/modules/reports/consts/Report'
import styles from './DataSourceMenu.less'

const { I18n } = window

const getCustomFactorValueOptions = () => CUSTOM_FACTOR_VALUE_FIELDS.map(field => ({
  label: I18n.t(`administration.report_builder.property_panel.custom_factor_fields.${field}`), value: field,
}))

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

  const handleSourceSubtypeChange = (e) => {
    const { value } = e.target
    updateAll((item) => {
      item.props.source = { ...item.props.source, subType: value }
    })
  }

  const changeCustomFactorValueFields = (value) => {
    updateAll((item) => {
      item.props.customFactorValueFields = value || []
    })
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
      <>
        <AssessmentProperties assessmentId={model.assessment_id} changeAssessment={changeAssessment} />
        <div>
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
        {GRAPH_TYPES_SUPPORTING_CUSTOM_FACTOR_FIELDS[model.props.type] && model.props.source?.type === 'Factor' && (
          <Space orientation="vertical" className="w-100">
            <div>
              <span>{I18n.t('administration.report_builder.property_panel.factor_value_type.label')}</span>
              <Radio.Group onChange={handleSourceSubtypeChange} value={model.props.source.subType || 'default'}>
                <Radio value="default">
                  {I18n.t('administration.report_builder.property_panel.factor_value_type.default')}
                </Radio>
                <Radio value="custom">
                  {I18n.t('administration.report_builder.property_panel.factor_value_type.custom')}
                </Radio>
              </Radio.Group>
            </div>
            {model.props.source.subType === 'custom' && (
              <AntdSelect
                title={I18n.t('administration.report_builder.property_panel.custom_factor_placeholder')}
                placeholder={I18n.t('administration.report_builder.property_panel.custom_factor_placeholder')}
                size="small"
                className="w-100"
                mode="multiple"
                value={_.result(model, 'props.customFactorValueFields', [])}
                getOptionValue={opt => opt.value}
                options={getCustomFactorValueOptions()}
                isClearable={false}
                autoFocus={false}
                onChange={changeCustomFactorValueFields}
              />
            )}
          </Space>
        )}
      </>
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
    <Space orientation="vertical" className="w-100" size={12}>
      <hr className={panelStyles.divider} />
      <BaseTypeProperties model={model} onSelect={handleSelect} />
      {renderSettingsBasedOnAssessment()}
      {renderSettingsBasedOnReportData()}
      {TypeComponent && (
        <TypeComponent
          singleChoice={singleChoice}
          onlyNumbers={onlyNumbers}
          modules={modules}
          onSelect={onSelect}
          assessment={assessment}
          sourceType={sourceType}
        />
      )}
    </Space>
  )
}

ChartsMenu.propTypes = {
  onSelect: PropTypes.func.isRequired,
  singleChoice: PropTypes.bool,
  onlyNumbers: PropTypes.bool,
  dataConfiguration: PropTypes.array.isRequired,
}

export default ChartsMenu
