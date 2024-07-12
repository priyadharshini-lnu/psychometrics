/* eslint-disable */
import _ from 'lodash'
import { Component } from 'react';
import Select from 'react-select'
import AppStore from '~/modules/reports/store/AppStore'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'

const ALL_FACTORS = 'All Factors'

class Factor extends Component {
  getOptions () {
    const { model, singleChoice } = this.props
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
    const { model, onSelect } = this.props
    const assessmentId = model.assessment_id
    const assessment = _.find(AppStore.assessments, { id: assessmentId })
    const dimensionId = assessment && assessment.dimensionId
    // add all
    if (_.find(factors, { id: ALL_FACTORS })) {
      factors = _.map(model.filterFactors(AppStore.factors[dimensionId]),
        f => ({ id: f.id, alias: `${f.alias}` }))
    }
    model.props.source.factors = factors
    onSelect()
  }

  render () {
    const { model, model: { type, props: { type: propType } }, singleChoice } = this.props

    if (type === 'Graph' && propType === 'Bubble') {
      return null
    }

    return (
      <Select
        name="form-field-name"
        value={getValue(this.getOptions(), _.result(model, 'props.source.factors', 'Choose factor'))}
        options={this.getOptions()}
        getOptionValue={opt => opt.id}
        getOptionLabel={opt => opt.alias}
        autoFocus={false}
        isMulti={!singleChoice}
        onChange={this.onChange}
        styles={{
          multiValueLabel: (baseStyles) => ({
            ...baseStyles,
            whiteSpace: 'normal',
            overflow: 'hidden',
          }),
        }}
      />
    )
  }
}

export default Factor
