import { useState } from 'react'
import _ from 'lodash'
import {
  Form as AntForm, Checkbox,
} from 'antd'
import BaseForm from '~/modules/admin/components/Form'
import HiddenInputList from './HiddenInputList'
import SubFactorList from './SubFactorList'
import ExternalList from './ExternalList'
import FIELDS from './fields'
import styles from './styles.less'

export default function Form (props) {
  const { factor, errors, factors } = props
  const [resource, setResource] = useState(factor)

  const onChange = ({ currentTarget }) => {
    const values = {
      [currentTarget.name]: currentTarget.value,
    }
    if (currentTarget.name === 'scoring_strategy'
      && (resource.scoring_strategy !== 'sub_factor_questions_sum' && resource.scoring_strategy !== 'questions_sum')) {
      values.use_percentage = false
    }
    setResource({ ...resource, ...values })
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
      <div className="ant-form-vertical">
        <InputFile onChange={onChange} value={resource.icon} />
      </div>
      {(resource.scoring_strategy === 'sub_factor_questions_sum' || resource.scoring_strategy === 'questions_sum')
        && (
        <div className="mtm mbm">
          <Checkbox
            name="use_percentage"
            onChange={({ target }) => onChange({ currentTarget: { name: target.name, value: target.checked ? 1 : 0 } })}
            checked={resource.use_percentage}
          >
            Use percentage of correct answers
            <br />
            <small>(If normed score not present)</small>
          </Checkbox>
        </div>
        )
      }
      {(resource.scoring_strategy === 'sub_factors_average'
        || resource.scoring_strategy === 'sub_factors_conditional_average')
        && (
        <div className="mtm mbm">
          <Checkbox
            name="use_sub_factor_norm_score"
            onChange={({ target }) => onChange({ currentTarget: { name: target.name, value: target.checked ? 1 : 0 } })}
            checked={resource.use_sub_factor_norm_score}
          >
            {I18n.t('administration.factors.form.use_sub_factor_norm_score')}
          </Checkbox>
        </div>
        )
      }
      {!['questions', 'questions_sum', 'external_score'].includes(resource.scoring_strategy)
        && <SubFactorList factors={factors} factor={resource} onChange={onChange} errors={errors} />}
      {resource.scoring_strategy === 'external_score'
        && <ExternalList factors={factors} factor={resource} onChange={onChange} errors={errors} />}
    </>
  )
}


// TODO (atanych): dont use this component in future. We should avoid ruby form and ruby modal and use react entirely
const InputFile = ({ value, onChange }) => (
  <AntForm.Item label="Icon" className={styles.fileContainer} labelCol={{ flex: 'none' }}>
    <input name="resource[icon]" type="file" className="mbm" />
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
