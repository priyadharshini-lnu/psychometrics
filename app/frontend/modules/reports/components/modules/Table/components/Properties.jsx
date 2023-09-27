import { Component } from 'react'
import { Space, Typography, Select } from 'antd'
import _ from 'lodash'
import AssessmentProperties from '~/modules/reports/components/modules/CommonProperties/AssessmentProperties'
import AppStore from '~/modules/reports/store/AppStore'
import clearAfterAssessmentChange from '~/modules/reports/components/modules/CommonMethods/clearAfterAssessmentChange'
import ModuleConfigs from '~/modules/reports/consts/ModuleConfigs'
import { PropTypes as PropertyVies } from './Types'

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
]

class Properties extends Component {
  handleTableTypeChange = (value) => {
    const { model } = this.props

    if (model.props.type === value) return null

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
        factors: _.map(AppStore.subfactors[dimensionId], this.factor),
      }
    }
    model.update()
    this.forceUpdate()
  }

  factor = f => ({
    id: f.id,
    alias: `${f.alias.substring(0, 24)}`,
  })

  changeAssessment = (assessmentId) => {
    const { model } = this.props
    model.assessment_id = assessmentId
    clearAfterAssessmentChange(model)
    model.update()
    this.forceUpdate()
  }

  renderTypeProps () {
    const { model } = this.props
    const View = PropertyVies[model.props.type]
    if (!View) {
      return
    }
    return <View {...this.props} key={model.id} />
  }

  render () {
    const { model } = this.props
    const {
      props: { type },
      assessment_id,
    } = model

    return (
      <Space size="small" direction="vertical" className="w-100">
        <Typography.Text strong>Table options</Typography.Text>
        <div>
          <Typography.Text>Table type</Typography.Text>
          <Select
            className="w-100"
            style={{ maxWidth: 'calc(220px - 30px)' }}
            size="small"
            options={TABLE_TYPE_OPTIONS}
            value={type}
            onChange={this.handleTableTypeChange}
          />
        </div>
        <AssessmentProperties
          assessmentId={assessment_id}
          changeAssessment={this.changeAssessment}
        />
        {this.renderTypeProps()}
      </Space>
    )
  }
}

export default Properties
