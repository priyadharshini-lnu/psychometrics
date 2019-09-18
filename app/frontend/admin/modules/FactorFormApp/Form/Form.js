import React, { useState } from 'react'
import _ from 'lodash'
import {
  Form as AntForm, Tooltip, Icon, Checkbox,
} from 'antd'
import BaseForm from 'admin/sharedComponents/Form'
import { BASE_LAYOUT } from 'admin/sharedComponents/Form/layouts'
import HiddenInputList from './HiddenInputList'
import SubFactorList from './SubFactorList'

const ScoringStrategyLabel = () => (
  <span>
    Scoring Strategy&nbsp;
    <Tooltip
      title={(
        <div>
          <strong>Questions:</strong>
          {' '}
This is like current scoring method when there are questions linked to a factor.
          <br />
          <br />
          <strong>Questions of Other Factors:</strong>
          {' '}
This is like current scoring method when there are sub-factors
          for a factor, only change is the addition of weight.
          <br />
          <br />
          <strong>Weighted Sum of Factors:</strong>
          {' '}
Here the scores of the selected other factors are multiplied by
          their weights are added.
        </div>
)}
    >
      <Icon type="question-circle-o" />
    </Tooltip>
  </span>
)

const FIELDS = [
  {
    label: 'Name',
    name: 'name',
    type: 'Input',
    required: true,
  },
  {
    label: 'Description',
    name: 'description',
    type: 'TextArea',
  },
  {
    label: <ScoringStrategyLabel />,
    name: 'scoring_strategy',
    type: 'Select',
    getOptions: ({ scoringStrategies }) => scoringStrategies,
  },
]

// TODO (atanych): dont use this component in future. We should avoid ruby form and ruby modal and use react entirely
const InputFile = ({ value, onChange }) => (
  <AntForm.Item label="Icon" {...BASE_LAYOUT}>
    <input name="resource[icon]" type="file" />
    {value && (
      <div className="mtm">
        <img width="50" src={value} alt="Factor Icon" />
      </div>
    )}
    <Checkbox
      name="remove_icon"
      onChange={({ target }) => onChange({ currentTarget: { name: target.name, value: target.checked ? 1 : 0 } })}
    >
      Remove icon
    </Checkbox>
  </AntForm.Item>
)
export default function Form (props) {
  const { factor, errors, factors } = props
  const [resource, setResource] = useState(factor)

  const onChange = ({ currentTarget }) => {
    setResource({ ...resource, [currentTarget.name]: currentTarget.value })
  }

  // The function is used as adapter for rails nested attributes functionality
  const findDestroyedSubFactors = () => factor.factors_sub_factors
    .reduce((result, { sub_factor_id: subFactorId, id }) => {
      if (_.some(resource.factors_sub_factors, fs => fs.sub_factor_id === subFactorId)) {
        return result
      }
      return [...result, { id, _destroy: 1 }]
    }, [])

  // The function is used as adapter for rails nested attributes functionality
  const gatherFactorsSubFactorsAttr = () => {
    const factorsSubFactors = resource.factors_sub_factors.map((f) => {
      const { id } = factor.factors_sub_factors
        .find(({ sub_factor_id: subFactorId }) => subFactorId === f.sub_factor_id) || {}
      if (id) return { ...f, id }
      return f
    })
    return [...factorsSubFactors, ...findDestroyedSubFactors()]
  }

  return (
    <>
      <HiddenInputList
        resource={{
          ..._.omit(resource, ['icon', 'factors_sub_factors']),
          factors_sub_factors_attributes: gatherFactorsSubFactorsAttr(),
        }}
        resourceName="resource"
      />
      <BaseForm fields={FIELDS} errors={errors} context={props} onChange={onChange} resource={resource} />
      <InputFile onChange={onChange} value={resource.icon} />
      <SubFactorList factors={factors} factor={resource} onChange={onChange} />
    </>
  )
}
