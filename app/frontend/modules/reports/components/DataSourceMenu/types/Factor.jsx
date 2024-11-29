/* eslint-disable */
import _ from 'lodash'
import { Component } from 'react';
import Select from 'react-select'
import AppStore from '~/modules/reports/store/AppStore'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import { Space } from 'antd';
import {HintCheckbox} from '~/glint'

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

  changeAllFactors = () => {
    const { model, onSelect } = this.props
    model.props.source.allFactors = !model.props.source.allFactors
    onSelect()
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
          <HintCheckbox
            label="All Factors"
            checked={source?.allFactors}
            onChange={this.changeAllFactors}
            hints={[
              'When checked, all factors will be displayed.',
              'When unchecked, only selected factors will be displayed.',
            ]}
          />
          {!source?.allFactors && <Select
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
