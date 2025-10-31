/* eslint-disable */
import _ from 'lodash'
import { Component } from 'react';
import Select from 'react-select'
import AppStore from '~/modules/reports/store/AppStore'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import { Space } from 'antd';
import {HintCheckbox} from '~/glint'
import { RenderJobFactorModes, RenderSkillTypeModes } from '~/modules/reports/components/modules/Table/components/Properties'

const ALL_FACTORS = 'All Factors'

class Factor extends Component {
  getOptions () {
    const { modules, singleChoice } = this.props
    const model = modules[0]
    const assessmentId = model.assessment_id
    const assessment = _.find(AppStore.assessments, { id: assessmentId })
    const dimensionId = assessment && assessment.dimensionId
    const factors = _.map(AppStore.factors[dimensionId], f => ({
      id: f.id,
      alias: `${f.alias}`,
    }))
    if (!singleChoice) {
      factors.unshift({ id: ALL_FACTORS, alias: ALL_FACTORS })
    }

    return model.filterFactors(factors)
  }

  onChange = (factors) => {
    const { modules, onSelect } = this.props
    const model = modules[0]
    const assessmentId = model.assessment_id
    const assessment = _.find(AppStore.assessments, { id: assessmentId })
    const dimensionId = assessment && assessment.dimensionId
    // add all
    if (_.find(factors, { id: ALL_FACTORS })) {
      factors = _.map(model.filterFactors(AppStore.factors[dimensionId]),
        f => ({ id: f.id, alias: `${f.alias}` }))
    }
    modules.forEach((model) => {
      model.props.source.factors = factors
    })
    onSelect()
  }

  changeAllFactors = (value) => {
    const { modules, onSelect } = this.props
    modules.forEach((model) => {
      model.props.skillType = []
      model.props.source.allFactors = value
    })
    onSelect()
  }

  collectFactors = () => {
    const { modules } = this.props
    const model = modules[0]

    const assessmentId = model.assessment_id
    const assessment = _.find(AppStore.assessments, { id: assessmentId })
    const dimensionId = assessment && assessment.dimensionId
    let factors = AppStore.factors[dimensionId] || []

    const { skillType } = model.props

    // Apply skillType filtering if skillType is selected i.e Skill type
    if (skillType && skillType.length > 0) {
      factors = factors.filter(factor => skillType.includes(factor.skill_type))
    }
    return factors
  }

  changeSkillType = (value) => {
    const { modules } = this.props
    modules.forEach((model) => {
    model.props.source.allFactors = false
    if (!value || value.length === 0) {
        model.props.skillType = []
        model.props.source.factors = []
      } else {
      model.props.skillType = value
      const factors = this.collectFactors()
      model.props.source.factors = factors
      }
      model.update()
    })
  }

  render () {
    const { modules, singleChoice } = this.props
    const model = modules[0]
    const  { type, props: { type: propType, source } } = model

    if (type === 'Graph' && propType === 'Bubble') {
      return null
    }

    return (
      <>
        <Space direction="vertical">
        <RenderJobFactorModes modules={modules} />
        <RenderSkillTypeModes modules={modules} callback={this.changeSkillType} />
          <HintCheckbox
            label="All Factors"
            checked={source?.allFactors}
            onChange={this.changeAllFactors}
            hints={[
              'When checked, all factors will be displayed.',
              'When unchecked, only selected factors will be displayed.',
            ]}
          />
          {!source?.allFactors && !(model.props.skillType && model.props.skillType.length > 0) && <Select
            name="form-field-name"
            value={getValue(this.getOptions(), _.result(model, 'props.source.factors', 'Choose factor'))}
            options={this.getOptions()}
            getOptionValue={opt => opt.id}
            getOptionLabel={opt => opt.alias}
            autoFocus={false}
            hideSelectedOptions={false}
            isMulti={!singleChoice}
            onChange={this.onChange}
            styles={{
              multiValueLabel: (baseStyles) => ({
                ...baseStyles,
                whiteSpace: 'normal',
                overflow: 'hidden',
              }),
            }}
          />}
          </Space>
      </>
    )
  }
}

export default Factor
