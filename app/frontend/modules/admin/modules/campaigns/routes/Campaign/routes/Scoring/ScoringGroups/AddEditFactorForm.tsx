import {
  FC, useEffect, useState, Fragment,
} from 'react'
import _ from 'lodash'
import {
  Drawer, Form, Input, Button, Select, Spin, Switch,
} from 'antd'
import { Store } from 'antd/lib/form/interface'
import { useParams } from 'react-router-dom'
import ResourceForm from '~/components/ResourceForm'
import { slugify } from '~/utils/string'
import { DirectionalNavigateBackIcon, LuaEditor } from '~/glint'
import { useResources } from '~/hooks/useResources'

interface FactorData extends Store {
  id: number | string
  dimensionId?: string
  assessmentId?: string
  factorId?: string
}

type Props = {
  open: boolean
  onClose: () => void
  addFactor?: (values) => Promise<void> | void
  editFactor?: (values) => Promise<void> | void
  factorData?: FactorData
}

const { I18n } = window

const factorTypes = [
  { label: 'Assessment', value: 'assessment' },
  { label: 'Assessor Scoring', value: 'assessor_scoring' },
  { label: 'Formula', value: 'formula' },
]

const assessmentScoreTypes = [
  { label: I18n.t('administration.scoring.score_types.norm_score'), value: 'norm_score' },
  { label: I18n.t('administration.scoring.score_types.score'), value: 'score' },
  { label: I18n.t('administration.scoring.score_types.zscore'), value: 'zscore' },
  { label: I18n.t('administration.scoring.score_types.percentile'), value: 'percentile' },
  { label: I18n.t('administration.scoring.score_types.percentage'), value: 'percentage' },
]

interface Assessment {
  id: string
  name: string
  assessment: { id: string, name: string, dimension: { id: string } }
}

interface Factor {
  id: string
  name: string
}

interface Dimension {
  id: string
  name: string
}

export const AddEditFactorForm: FC<Props> = ({
  open, onClose, addFactor, factorData, editFactor,
}) => {
  const { campaignId } = useParams<{campaignId: string}>()
  // this is required to trigger re-render when fields changed through form.setFieldsValue
  const [, setFields] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [codeValueEditedByUser, setCodeValueEditedByUser] = useState(false)
  const [form] = Form.useForm()
  const nameValue = Form.useWatch('name', form)
  const factorType = Form.useWatch('factorType', form)

  const isNew = factorData === undefined
  const initialValues = factorData
    ? {
      ...factorData,
      assessment_id: factorData.assessmentId,
      factor_id: factorData.factorId,
      dimension_id: factorData.dimensionId,
    }
    : { publicVisibility: true, outputType: 'numeric' }
  const [dimensionId, setDimensionId] = useState<string>(factorData?.dimensionId || '')

  useEffect(() => {
    const deriveCodeFromName = !factorData?.code && !codeValueEditedByUser
    deriveCodeFromName && form.setFieldsValue({ code: slugify(nameValue || '') })
  }, [nameValue])

  useEffect(() => {
    if (open) {
      setDimensionId(factorData?.dimensionId || '')
      form.resetFields()
      setCodeValueEditedByUser(false)
    }
  }, [factorData, open])

  useEffect(() => {
    setIsEditing(!!factorData)
  }, [factorData])

  const {
    data: dimensions, setData: setDimensions, isLoading: isDimensionsLoading,
    collectionAction: fetchDimensions,
  } = useResources<Dimension>('dimensions', {
    basePath: `campaigns/${campaignId}`,
    apiConfig: {
      fields: { dimensions: ['id', 'name'] },
    },
  })

  const {
    data: assessments, fetch: fetchAssessments, isLoading: isAssessmentsLoading,
  } = useResources<Assessment>('campaign_assessments', {
    basePath: `campaigns/${campaignId}`,
    apiConfig: {
      include: ['assessment'],
      fields: { assessments: ['id', 'name', 'dimension'] },
      filter: {
        assessment_category_not_in: ['assessor_form', 'lead_assessor_form', 'threesixty'],
        assessment_archived_eq: 'false',
      },
    },
  })

  const {
    data: assessmentFactors, setData: setFactorsData, fetch: fetchFactors, isLoading: isFactorsLoading,
  } = useResources<Factor>('factors', {
    basePath: `campaigns/${campaignId}/dimensions/${dimensionId}`,
  })


  const getAssessments = (): Assessment[] => {
    if (!factorData || !factorData.assessment
        || assessments.find(d => factorData?.assessmentId === d.assessment.id)) {
      return assessments
    }

    return [...assessments, { ...factorData.assessment, assessment: factorData.assessment }]
  }

  const getDimensions = (): Dimension[] => {
    if (!factorData || !factorData.dimension
        || dimensions.find(d => factorData?.dimension?.id === d.id)) {
      return dimensions
    }

    return [...dimensions, factorData.dimension]
  }

  const getFactors = (): Factor[] => {
    if (!factorData || !factorData.factor
        || assessmentFactors.find(d => factorData?.facrorId === d.id)) {
      return assessmentFactors
    }

    return [...assessmentFactors, factorData.factor]
  }


  const handleFormFinish = () => {
    onClose()
  }

  let formFieldBasedOnFactorType = factorType === 'assessment' ? (
    <Fragment key="assessment">
      <Form.Item
        name="assessment_id"
        label={I18n.t('administration.scoring.assessment')}
      >
        <Select
          showSearch
          onSearch={(value) => {
            fetchAssessments({
              apiConfig: {
                filter: {
                  assessment_name_cont: value,
                },
              },
            })
          }}
          onSelect={(_, option) => {
            setDimensionId(option.assessment?.dimension?.id)
            form.setFieldValue('factor_id', undefined)
            setFactorsData([])
          }}
          notFoundContent={isAssessmentsLoading('fetch') ? <Spin size="small" /> : null}
          filterOption={false}
          allowClear
          options={getAssessments().map(({ assessment }) => ({
            value: assessment.id,
            label: assessment.name,
            assessment,
          }))}
        />
      </Form.Item>
      <Form.Item
        name="factor_id"
        label={I18n.t('administration.scoring.factor')}
      >
        <Select
          disabled={!dimensionId}
          showSearch
          onSearch={value => fetchFactors({
            apiConfig: {
              filter: {
                dimension_id_eq: dimensionId,
                filterable_fields: value,
              },
            },
          })}
          placeholder={!dimensionId
            ? I18n.t('administration.scoring.select_assessment_first')
            : I18n.t('administration.scoring.select_factor')}
          notFoundContent={isFactorsLoading('fetch') ? <Spin size="small" /> : null}
          filterOption={false}
          allowClear
          options={getFactors().map(factor => ({
            value: factor.id,
            label: factor.name,
          }))}
        />
      </Form.Item>
      <Form.Item name="assessmentScoreType" label={I18n.t('administration.scoring.assessment_scoring_type')}>
        <Select options={assessmentScoreTypes} />
      </Form.Item>
    </Fragment>
  ) : null

  if (factorType === 'assessor_scoring') {
    formFieldBasedOnFactorType = (
      <Fragment key="assessor_scoring">
        <Form.Item name="dimension_id" label={I18n.t('administration.scoring.dimension')}>
          <Select
            showSearch
            onSearch={(value) => {
              fetchDimensions({
                action: 'assessor_dimensions',
                method: 'get',
                apiConfig: {
                  filter: {
                    filterable_fields: value,
                  },
                },
              }).then(setDimensions)
            }}
            onSelect={(value) => {
              setDimensionId(value)
              form.setFieldValue('factor_id', undefined)
              setFactorsData([])
            }}
            filterOption={false}
            notFoundContent={isDimensionsLoading('get/assessor_dimensions') ? <Spin size="small" /> : null}
            options={getDimensions().map(dimension => ({
              value: dimension.id,
              label: dimension.name,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="factor_id"
          label={I18n.t('administration.scoring.factor')}
        >
          <Select
            disabled={!dimensionId}
            showSearch
            onSearch={value => fetchFactors({
              apiConfig: {
                filter: {
                  dimension_id_eq: dimensionId,
                  filterable_fields: value,
                },
              },
            })}
            placeholder={!dimensionId
              ? I18n.t('administration.scoring.select_assessment_first')
              : I18n.t('administration.scoring.select_factor')}
            notFoundContent={isFactorsLoading('fetch') ? <Spin size="small" /> : null}
            filterOption={false}
            allowClear
            options={getFactors().map(factor => ({
              value: factor.id,
              label: factor.name,
            }))}
          />
        </Form.Item>
        <Form.Item name="assessmentScoreType" label={I18n.t('administration.scoring.assessment_scoring_type')}>
          <Select options={assessmentScoreTypes} />
        </Form.Item>
      </Fragment>
    )
  }

  if (factorType === 'formula') {
    formFieldBasedOnFactorType = (
      <>
        <Form.Item name="formula" label={I18n.t('administration.scoring.formula')}>
          <LuaEditor controlled />
        </Form.Item>
      </>
    )
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Drawer
      closeIcon={<DirectionalNavigateBackIcon />}
      title={isEditing ? I18n.t('administration.scoring.edit_factor') : I18n.t('administration.scoring.add_factor')}
      open={open}
      width="70%"
      onClose={handleClose}
      destroyOnClose
    >
      <ResourceForm
        resourceName="campaign_factors"
        storeManager={{ form }}
        resource={editFactor ? factorData : undefined}
        resourceId={factorData?.id}
        showSuccessMessages
        formProps={{
          labelAlign: 'left',
          preserve: false,
          initialValues,
          onFieldsChange: (_, allFields) => {
            setFields(allFields)
          },
          validateMessages: {
            required: I18n.t('administration.scoring.required_error'),
            pattern: { mismatch: I18n.t('administration.scoring.pattern_error') },
          },
        }}
        scrollToFirstError
        request={{
          createResource: addFactor,
          updateResource: editFactor,
        }}
        onSuccessfulSubmission={handleFormFinish}
        transformValues={(values: FactorData) => ({
          ..._.omit(values, 'dimension_id'),
          code: values.code || slugify(values.name),
          name: nameValue.trim(),
        })}
      >
        {() => (
          <>
            <Form.Item
              name="name"
              label={I18n.t('administration.scoring.name')}
              rules={[{
                required: true,
                whitespace: true,
                pattern: /^[a-zA-Z0-9\- ]+$/,
              }]}
            >
              <Input maxLength={64} />
            </Form.Item>
            <Form.Item name="code" label={I18n.t('administration.scoring.code')}>
              <Input
                maxLength={64}
                onInput={(e) => {
                  !codeValueEditedByUser && setCodeValueEditedByUser(true)
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignorets-ignore
                  e.target.value = alphaNumericWithUnderscore(e.target.value)
                }}
              />
            </Form.Item>
            <Form.Item name="description" label={I18n.t('administration.scoring.description')}>
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="outputType" label={I18n.t('administration.scoring.output_type')}>
              <Select defaultValue="numeric">
                {['numeric', 'string'].map(
                  value => <Select.Option key={value} value={value}>{value}</Select.Option>,
                )}
              </Select>
            </Form.Item>
            <Form.Item
              name="factorType"
              label={I18n.t('administration.scoring.type')}
            >
              <Select disabled={!isNew}>
                {factorTypes.map(type => (
                  <Select.Option key={type.value} value={type.value}>
                    {type.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            {formFieldBasedOnFactorType}
            <Form.Item label={I18n.t('administration.scoring.public')} name="publicVisibility" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">{I18n.t('administration.scoring.save')}</Button>
            </Form.Item>
          </>
        )}
      </ResourceForm>
    </Drawer>
  )
}

const alphaNumericWithUnderscore = string => string.trim() // trim leading or trailing whitespace
  .toLowerCase() // convert to lowercase
  .replace(/[^a-z0-9_]/g, '') // remove non-alphanumeric characters expcept underscore
