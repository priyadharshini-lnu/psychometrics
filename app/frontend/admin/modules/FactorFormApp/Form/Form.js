import React, { useState } from 'react'
import _ from 'lodash'
import {
  Form as AntForm, Checkbox,
} from 'antd'
import BaseForm from 'admin/sharedComponents/Form'
import { BASE_LAYOUT } from 'admin/sharedComponents/Form/layouts'
import HiddenInputList from './HiddenInputList'
import SubFactorList from './SubFactorList'
import FIELDS from './fields'

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
