import { Space, Typography, Select } from 'antd'
import _ from 'lodash'
import AssessmentProperties from '~/modules/reports/components/modules/CommonProperties/AssessmentProperties'
import AppStore from '~/modules/reports/store/AppStore'
import clearAfterAssessmentChange from '~/modules/reports/components/modules/CommonMethods/clearAfterAssessmentChange'
import ModuleConfigs from '~/modules/reports/consts/ModuleConfigs'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import { PropTypes as PropertyVies } from './Types'
import PropertyFonts from '~/modules/reports/components/PropertyFonts'
import styles from './TableModule.less'
import { SKILL_TYPES, JOB_ROLE_OPTIONS } from '~/modules/reports/core/builder/consts'

const { I18n } = window

const TABLE_TYPE_OPTIONS = [
  { value: 'SimpleTable', label: 'Simple Table' },
  { value: 'ThreeSixtyDefault', label: 'Default 360' },
  { value: 'HighestLowest', label: 'Highest/Lowest' },
  { value: 'GapAssessment', label: 'Gap Assessment' },
  { value: 'ThreeSixtyReportSummary', label: '360 Report Summary' },
  { value: 'VideoResponse', label: 'Video Response' },
  { value: 'SingleValue', label: 'Single Value' },
  { value: 'Competencies', label: 'Competencies' },
  { value: 'ResponseSummary', label: 'Response Summary Statistics' },
  { value: 'FactorQuestionsScore', label: 'Factor - Questions Mean Score' },
  { value: 'FactorsTable', label: 'Factors' },
  { value: 'CPIOccupations', label: 'Career - Occupations' },
  { value: 'PotentialCareerShort', label: 'Career - Potential (short)' },
  { value: 'PotentialCareerFull', label: 'Career - Potential (full)' },
  { value: 'PotentialKeyCareerTracks', label: 'Career - Key Tracks' },
  { value: 'StrengthClusters', label: 'Career - Strength Clusters' },
  { value: 'InnovationStyles', label: 'Innovation Styles' },
  { value: 'CampaignFactorsTable', label: 'Campaign Factors' },
]

export const RenderJobFactorModes = ({ modules }) => {
  const model = modules[0]
  const assessmentId = model.assessment_id
  const assessment = _.find(AppStore.assessments, { id: assessmentId })

  if (!assessment?.isSkillRater) return null

  return (
    <div>
      {JOB_ROLE_OPTIONS.map((option, i) => (
        <label
          className={styles.inputLabel}
          key={i}
        >
          <input
            className="mrs"
            type="checkbox"
            name="job-factors"
            value={option.value}
            checked={model.props[option.value]}
            onChange={e => changeJobFactors(e, modules)}
          />
          {option.label}
        </label>
      ))}
    </div>
  )
}

const changeJobFactors = (e, modules) => {
  const { value, checked } = e.currentTarget
  modules.forEach((model) => {
    model.props[value] = checked
    model.update()
  })
}


export const RenderSkillTypeModes = ({ modules, callback }) => {
  const model = modules[0]
  const assessmentId = model.assessment_id
  const assessment = _.find(AppStore.assessments, { id: assessmentId })

  if (!assessment?.isSkillRater) return null

  return (
    <>
      <span className={styles.label}>{I18n.t('administration.report_builder.property_panel.skill_type_label')}</span>
      <Select
        name="skill-type-select"
        mode="multiple"
        placeholder={I18n.t('administration.report_builder.property_panel.skill_type_placeholder')}
        value={getValue(SKILL_TYPES, _.result(model, 'props.skillType', 'Select skill type'))}
        allowClear
        className="w-100 mb-4"
        options={SKILL_TYPES}
        onChange={value => callback(value)}
      />
    </>
  )
}

const Properties = ({ modules }) => {
  const model = modules[0]

  const forceUpdate = () => {
    modules.forEach((item) => {
      item.update()
    })
  }

  const handleTableTypeChange = (value) => {
    modules.forEach((model) => {
      if (model.props.type === value) return

      model.props.type = value
      model.props.rowData = null
      model.props.headerData = null
      const defaultProps = ModuleConfigs.Table.defaultProps[value] || {}
      model.props = { ...model.props, ...defaultProps }

      const assessmentId = model.assessment_id
      const assessment = _.find(AppStore.assessments, { id: assessmentId })
      const dimensionId = assessment && assessment.dimensionId

      if (['FactorsTable', 'StrengthClusters'].includes(value)) {
        model.props.source = {
          factors: _.map(AppStore.subfactors[dimensionId], factor),
        }
      }
      if (['CampaignFactorsTable'].includes(value)) {
        model.props.source = {
          campaignFactors: AppStore.report.campaignFactors,
        }
      }
      model.update()
    })

    forceUpdate()
  }

  const factor = f => ({
    id: f.id,
    alias: `${f.alias.substring(0, 24)}`,
  })

  const changeAssessment = (assessmentId) => {
    modules.forEach((model) => {
      model.assessment_id = assessmentId
      clearAfterAssessmentChange(model)
      model.update()
    })
    forceUpdate()
  }

  const renderTypeProps = () => {
    if (modules.length > 1 && _.uniqBy(modules, 'props.type').length > 1) { return null }

    const View = PropertyVies[model.props.type]
    if (!View) return null

    return <View {...{ model }} modules={modules} key={model.id} />
  }

  const { props: { type }, assessment_id } = model

  return (
    <Space size="small" orientation="vertical" className="w-100">
      <Typography.Text strong>{I18n.t('reports.modules.common.table_options')}</Typography.Text>
      <div>
        <Typography.Text>{I18n.t('reports.modules.common.table_type')}</Typography.Text>
        <Select
          className="w-100"
          size="small"
          options={TABLE_TYPE_OPTIONS}
          value={type}
          onChange={handleTableTypeChange}
        />
      </div>
      <AssessmentProperties
        assessmentId={assessment_id}
        changeAssessment={changeAssessment}
      />
      <hr className={styles.divider} />
      <div>{I18n.t('reports.modules.common.font')}</div>
      <PropertyFonts modules={modules} />
      <hr className={styles.divider} />
      {renderTypeProps()}
    </Space>
  )
}

export default Properties
