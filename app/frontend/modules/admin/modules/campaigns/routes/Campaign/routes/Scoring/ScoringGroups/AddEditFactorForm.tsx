import { FC, useState, Fragment } from 'react'
import _ from 'lodash'
import {
  Drawer, Form, Input, Button, Select, Spin,
} from 'antd'
import { Store } from 'antd/lib/form/interface'
import { useParams } from 'react-router-dom'
import ResourceForm from '~/components/ResourceForm'
import { slugify } from '~/utils/string'
import { DirectionalNavigateBackIcon, LuaEditor } from '~/glint'
import { useResources } from '~/hooks/useResources'

interface FactorData extends Store {
  id: number | string
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
  const [form] = Form.useForm()
  const nameValue = Form.useWatch('name', form)

  const factorType = Form.useWatch('factorType', form)

  const isNew = factorData === undefined
  const initialValues = factorData || { publicVisibility: true, outputType: 'numeric' }
  const [dimensionId, setDimensionId] = useState<string>('')

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
        || assessments.find(d => factorData?.assessment?.id === d.id)) {
      return assessments
    }

    return [...assessments, factorData.assessment]
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
        || assessmentFactors.find(d => factorData?.factor?.id === d.id)) {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ControlledCodeInput: FC<{value?:string, onChange?: (value: string) => void;}> = ({ value = '', onChange }) => (
    <Input
      type="text"
      value={value || slugify(nameValue || '')}
      onChange={(e) => {
        onChange && onChange(e.target.value)
      }}
    />
  )

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Drawer
      closeIcon={<DirectionalNavigateBackIcon />}
      title={I18n.t('administration.scoring.add_factor')}
      open={open}
      width="70%"
      onClose={handleClose}
      destroyOnClose
    >
      <ResourceForm
        resourceName="memberships"
        storeManager={{ form }}
        resource={editFactor ? factorData : undefined}
        resourceId={factorData?.id}
        readableResourceName="Admin"
        formProps={{
          labelAlign: 'left',
          id: 'edit_participant_form',
          preserve: false,
          initialValues,
        }}
        scrollToFirstError
        request={{
          createResource: addFactor,
          updateResource: editFactor,
        }}
        onSuccessfulSubmission={handleFormFinish}
        transformValues={values => (_.omit(values, 'dimension_id'))}
      >
        {() => (
          <>
            <Form.Item
              name="name"
              label={I18n.t('administration.scoring.name')}
            >
              <Input />
            </Form.Item>
            <Form.Item name="code" label={I18n.t('administration.scoring.code')}>
              <ControlledCodeInput />
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
            <Form.Item
              valuePropName="checked"
              name="publicVisibility"
              wrapperCol={{ span: 1 }}
              label={I18n.t('administration.scoring.public')}
            >
              <Input type="checkbox" />
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
