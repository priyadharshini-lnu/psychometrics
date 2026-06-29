import { useState, useEffect } from 'react'
import _ from 'lodash'
import {
  Form as AntForm, Checkbox,
  InputNumber, Alert, Flex, Typography, Radio,
} from 'antd'
import BaseForm from '~/modules/admin/components/Form'
import HiddenInputList from './HiddenInputList'
import SubFactorList from './SubFactorList'
import IndicatorList from './IndicatorList'
import ExternalList from './ExternalList'
import ScoreDefinitions from './ScoreDefinitions'
import { generateScoreDefinitionsFromRange } from './utils/scoreDefinitions'
import FIELDS from './fields'
import styles from './styles.less'
import { LuaEditor } from '~/glint'

const { I18n } = window

const INDICATOR_SUPPORTED_STRATEGIES = [
  'sub_factors_average',
  'sub_factors_conditional_average',
  'sub_factors_sum',
]

const SUB_FACTOR_ONLY_STRATEGIES = [
  'sub_factor_questions',
  'sub_factor_questions_sum',
]

export default function Form (props) {
  const { factor, errors, factors } = props
  const [resource, setResource] = useState(factor)
  const [childrenFactorType, setChildrenFactorType] = useState('regular')
  const [originalFactorsSubFactors] = useState(() => factor.factors_sub_factors || [])

  const hasPersistedChildren = (resource.factors_sub_factors || [])
    .filter(c => !c._destroy) // eslint-disable-line no-underscore-dangle
    .some(c => c.id)

  useEffect(() => {
    setChildrenFactorType(factor.child_factor_type || 'regular')
  }, [factor])

  const onChange = ({ currentTarget }) => {
    const { value, name } = currentTarget
    const values = {
      [name]: value,
    }
    if (name === 'scoring_strategy') {
      if (value !== 'sub_factor_questions_sum' && value !== 'questions_sum') {
        values.use_percentage = false
      }
      if (value !== 'questions_percentage') {
        values.scale_min = null
        values.scale_max = null
      }
    }

    setResource({ ...resource, ...values })
  }

  const onValuesChange = (_, values) => {
    setResource({ ...resource, ...values })
  }


  const findDestroyedIndicators = () => {
    const currentIndicators = resource.factors_sub_factors || []

    return originalFactorsSubFactors
      .filter(original => original.id && !original._is_new) // eslint-disable-line no-underscore-dangle
      .filter(original => !currentIndicators.some(current => current.id === original.id))
      .map(({ id }) => ({ id, _destroy: 1 }))
  }

  const separateIndicatorsFromFactors = () => {
    const attrs = resource.factors_sub_factors || []
    const newIndicators = attrs.filter(f => f._is_new) // eslint-disable-line no-underscore-dangle
    const existingFactors = attrs.filter(f => !f._is_new) // eslint-disable-line no-underscore-dangle
    const destroyedIndicators = findDestroyedIndicators()
    return {
      newIndicators,
      existingFactors: [...existingFactors, ...destroyedIndicators],
    }
  }

  return (
    <>
      <HiddenInputList
        resource={{
          ..._.omit(resource, ['icon', 'factors_sub_factors']),
          factors_sub_factors_attributes: separateIndicatorsFromFactors().existingFactors,
          new_indicators_attributes: separateIndicatorsFromFactors().newIndicators,
        }}
        resourceName="resource"
      />
      <BaseForm fields={FIELDS} errors={errors} context={props} onChange={onChange} resource={resource} />
      <AntForm
        initialValues={{ precision: resource.precision }}
        onValuesChange={onValuesChange}
        layout="vertical"
        colon={false}
      >
        <AntForm.Item
          label="Precision"
          name="precision"
          validateStatus={errors.precision?.length && 'error'}
          help={errors.precision?.join(', ')}
        >
          <InputNumber parser={value => value?.replace(/\D.*$/g, '')} min={0} max={6} />
        </AntForm.Item>
      </AntForm>
      <AntForm
        initialValues={{
          score_min: resource.score_min,
          score_max: resource.score_max,
        }}
        onValuesChange={onValuesChange}
        layout="vertical"
        colon={false}
      >
        <Flex gap="middle">
          <AntForm.Item
            label={I18n.t('admin.score_min')}
            name="score_min"
            validateStatus={errors.score_min?.length && 'error'}
          >
            <InputNumber min={1} max={10} />
          </AntForm.Item>
          <AntForm.Item
            label={I18n.t('admin.score_max')}
            name="score_max"
            validateStatus={errors.score_max?.length && 'error'}
          >
            <InputNumber min={1} max={10} />
          </AntForm.Item>
        </Flex>
        {errors.score_min?.length && <Alert message={errors.score_min.join(', ')} type="error" />}
      </AntForm>
      {resource.score_min !== null
        && resource.score_max !== null
        && resource.score_min !== undefined
        && resource.score_max !== undefined
        && (
          <ScoreDefinitions
            scoreDefinitions={generateScoreDefinitionsFromRange(
              resource.score_min,
              resource.score_max,
              resource.score_definitions || [],
            )}
            onChange={onChange}
          />
        )
      }
      {resource.scoring_strategy === 'questions_percentage' && (
        <AntForm
          initialValues={{
            scale_min: resource.scale_min,
            scale_max: resource.scale_max,
          }}
          onValuesChange={onValuesChange}
          layout="vertical"
          colon={false}
        >
          <AntForm.Item
            label="Scale Min"
            name="scale_min"
            validateStatus={errors.scale_min?.length && 'error'}
          >
            <InputNumber />
          </AntForm.Item>
          <AntForm.Item label="Scale Max" name="scale_max">
            <InputNumber />
          </AntForm.Item>
          {errors.scale_min?.length && <Alert message={errors.scale_min.join(', ')} type="error" />}
        </AntForm>
      )}
      {(resource.scoring_strategy === 'sub_factor_questions_sum' || resource.scoring_strategy === 'questions_sum')
        && (
          <div className="mtm mbm">
            <Checkbox
              name="use_percentage"
              onChange={({ target }) => onChange({
                currentTarget: { name: target.name, value: target.checked ? 1 : 0 },
              })}
              checked={resource.use_percentage}
            >
              Use percentage of correct answers
              <br />
              <small>(If normed score not present)</small>
            </Checkbox>
          </div>
        )
      }
      {['sub_factors_average', 'sub_factors_conditional_average', 'sub_factors_sum'].includes(resource.scoring_strategy)
        && (
          <div className="mtm mbm">
            <Checkbox
              name="use_sub_factor_norm_score"
              onChange={({ target }) => onChange({
                currentTarget: { name: target.name, value: target.checked ? 1 : 0 },
              })}
              checked={resource.use_sub_factor_norm_score}
            >
              {I18n.t('admin.factors_form_use_sub_factor_norm_score')}
            </Checkbox>
          </div>
        )
      }
      {INDICATOR_SUPPORTED_STRATEGIES.includes(resource.scoring_strategy)
        && (
          <AntForm
            key={childrenFactorType}
            initialValues={{ children_factor_type: childrenFactorType }}
            onValuesChange={(_, values) => {
              if (values.children_factor_type !== undefined) {
                setChildrenFactorType(values.children_factor_type)
              }
            }}
            layout="vertical"
            colon={false}
            className="mtm"
          >
            <AntForm.Item
              label={I18n.t('admin.children_factor_type')}
              name="children_factor_type"
              help={hasPersistedChildren ? I18n.t('admin.remove_children_to_change_type') : null}
            >
              <Radio.Group>
                <Radio value="regular" disabled={hasPersistedChildren && childrenFactorType !== 'regular'}>
                  Sub Factor
                </Radio>
                <Radio value="indicator" disabled={hasPersistedChildren && childrenFactorType !== 'indicator'}>
                  Indicator
                </Radio>
              </Radio.Group>
            </AntForm.Item>
          </AntForm>
        )
      }
      {INDICATOR_SUPPORTED_STRATEGIES.includes(resource.scoring_strategy) && childrenFactorType === 'regular'
        && <SubFactorList factors={factors} factor={resource} onChange={onChange} errors={errors} />}
      {INDICATOR_SUPPORTED_STRATEGIES.includes(resource.scoring_strategy) && childrenFactorType === 'indicator'
        && (
          <IndicatorList
            factor={resource}
            onChange={onChange}
            errors={errors}
            indicatorErrors={errors?.indicators_attributes}
          />
        )}
      {SUB_FACTOR_ONLY_STRATEGIES.includes(resource.scoring_strategy)
        && <SubFactorList factors={factors} factor={resource} onChange={onChange} errors={errors} />}
      {resource.scoring_strategy === 'external_score'
        && <ExternalList factors={factors} factor={resource} onChange={onChange} errors={errors} />}
      {resource.scoring_strategy === 'custom_formula'
        && (
          <AntForm
            layout="vertical"
            onValuesChange={onValuesChange}
            initialValues={{ custom_formula: resource.custom_formula }}
          >
            <AntForm.Item
              label={I18n.t('admin.factors_form_scoring_strategies_custom_formula')}
              name="custom_formula"
              className="mtm"
            >
              <LuaEditor />
            </AntForm.Item>
          </AntForm>
        )
      }
      <InputFile onChange={onChange} value={resource.icon} />
    </>
  )
}


// TODO (atanych): dont use this component in future. We should avoid ruby form and ruby modal and use react entirely
const InputFile = ({ value, onChange }) => (
  <Flex vertical gap="small" className={styles.fileContainer}>
    <Typography.Text>Icon</Typography.Text>
    <input name="resource[icon]" type="file" className="mbm" />
    {value && (
      <div className="mtm">
        <img width="50" src={value} alt="Factor Icon" />
      </div>
    )}
    <Checkbox
      name="purge_icon"
      onChange={({ target }) => onChange({ currentTarget: { name: target.name, value: target.checked ? 1 : 0 } })}
    >
      Remove icon
    </Checkbox>
  </Flex>
)
