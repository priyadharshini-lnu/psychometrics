import {
  FC, useEffect, useState, Fragment,
} from 'react'
import _ from 'lodash'
import {
  Drawer, Form, Input, InputNumber, Button, Select, Spin, Switch, Tree,
  Checkbox,
} from 'antd'
import { Store } from 'antd/es/form/interface'
import { useParams } from 'react-router-dom'
import { Key } from 'antd/es/table/interface'
import { DownOutlined, SaveOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import ResourceForm from '~/components/ResourceForm'
import { slugify } from '~/utils/string'
import { DirectionalNavigateBackIcon, LuaEditor } from '~/glint'
import { useResources } from '~/hooks/useResources'
import styles from './styles.less'

const { TreeNode } = Tree

interface FactorData extends Store {
  id: number | string
  dimensionId?: string
  assessmentId?: string
  factorId?: string
}

type groupName = {
  id: number | string;
  name: string;
  position: number;
};
type Props = {
  open: boolean
  onClose: () => void
  title: string
  addFactor?: (values) => Promise<void> | void
  editFactor?: (values) => Promise<void> | void
  factorData?: FactorData
  totalFactors?: FactorData[]
  groupName?: groupName[]
  handleFactorSelect: (id: Key[], value: object) => void
  dirtyFactors: object
  editFactors?: (form) => void
}

const { I18n } = window

const factorTypes = [
  { label: 'Assessment', value: 'assessment' },
  { label: 'Assessor Scoring', value: 'assessor_scoring' },
  { label: 'Formula', value: 'formula' },
  { label: 'External Score', value: 'external_score' },
]

const assessmentScoreTypes = [
  { label: I18n.t('admin.scoring_score_types_norm_score'), value: 'norm_score' },
  { label: I18n.t('admin.scoring_score_types_score'), value: 'score' },
  { label: I18n.t('admin.scoring_score_types_zscore'), value: 'zscore' },
  { label: I18n.t('admin.scoring_score_types_percentile'), value: 'percentile' },
  { label: I18n.t('admin.scoring_score_types_percentage'), value: 'percentage' },
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
  open, onClose, addFactor, factorData, editFactor, title,
  totalFactors, groupName, handleFactorSelect, dirtyFactors, editFactors,
}) => {
  const { campaignId } = useParams() as { campaignId: string }
  const [codeValueEditedByUser, setCodeValueEditedByUser] = useState(false)
  const [form] = Form.useForm()
  const nameValue = Form.useWatch('name', form)
  const factorType = Form.useWatch('factorType', form)
  const outputType = Form.useWatch('outputType', form)

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
        label={I18n.t('admin.scoring_assessment')}
      >
        <Select
          showSearch={{
            filterOption: false,
            onSearch: (value) => {
              fetchAssessments({
                apiConfig: {
                  filter: {
                    assessment_name_cont: value,
                  },
                },
              })
            },
          }}
          onSelect={(_, option) => {
            setDimensionId(option.assessment?.dimension?.id)
            form.setFieldValue('factor_id', undefined)
            setFactorsData([])
          }}
          notFoundContent={isAssessmentsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
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
        label={I18n.t('admin.scoring_factor')}
      >
        <Select
          disabled={!dimensionId}
          showSearch={{
            filterOption: false,
            onSearch: value => fetchFactors({
              apiConfig: {
                filter: {
                  dimension_id_eq: dimensionId,
                  filterable_fields: value,
                },
              },
            }),
          }}
          placeholder={!dimensionId
            ? I18n.t('admin.scoring_select_assessment_first')
            : I18n.t('admin.scoring_select_factor')}
          notFoundContent={isFactorsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
          allowClear
          options={getFactors().map(factor => ({
            value: factor.id,
            label: factor.name,
          }))}
        />
      </Form.Item>
      <Form.Item name="assessmentScoreType" label={I18n.t('admin.scoring_assessment_scoring_type')}>
        <Select options={assessmentScoreTypes} />
      </Form.Item>
    </Fragment>
  ) : null

  if (factorType === 'assessor_scoring') {
    formFieldBasedOnFactorType = (
      <Fragment key="assessor_scoring">
        <Form.Item name="dimension_id" label={I18n.t('admin.scoring_dimension')}>
          <Select
            showSearch={{
              filterOption: false,
              onSearch: (value) => {
                fetchDimensions({
                  action: 'assessor_dimensions',
                  method: 'get',
                  apiConfig: {
                    filter: {
                      filterable_fields: value,
                    },
                  },
                }).then(setDimensions)
              },
            }}
            onSelect={(value) => {
              setDimensionId(value)
              form.setFieldValue('factor_id', undefined)
              setFactorsData([])
            }}
            notFoundContent={
              isDimensionsLoading('get/assessor_dimensions')
                ? <Spin size="small" />
                : I18n.t('shared.no_results_found')
            }
            options={getDimensions().map(dimension => ({
              value: dimension.id,
              label: dimension.name,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="factor_id"
          label={I18n.t('admin.scoring_factor')}
        >
          <Select
            disabled={!dimensionId}
            showSearch={{
              filterOption: false,
              onSearch: value => fetchFactors({
                apiConfig: {
                  filter: {
                    dimension_id_eq: dimensionId,
                    filterable_fields: value,
                  },
                },
              }),
            }}
            placeholder={!dimensionId
              ? I18n.t('admin.scoring_select_assessment_first')
              : I18n.t('admin.scoring_select_factor')}
            notFoundContent={isFactorsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
            allowClear
            options={getFactors().map(factor => ({
              value: factor.id,
              label: factor.name,
            }))}
          />
        </Form.Item>
        <Form.Item name="assessmentScoreType" label={I18n.t('admin.scoring_assessment_scoring_type')}>
          <Select options={assessmentScoreTypes} />
        </Form.Item>
        {outputType === 'numeric'
          ? (
            <>
              <Form.Item
                name="minValue"
                rules={[{
                  required: true,
                }]}
                label={I18n.t('admin.min_value')}
              >
                <InputNumber className="w-100" />
              </Form.Item>
              <Form.Item
                name="maxValue"
                rules={[{
                  required: true,
                }]}
                label={I18n.t('admin.max_value')}
              >
                <InputNumber className="w-100" />
              </Form.Item>
              <Form.Item
                name="isNaAllowed"
                valuePropName="checked"
              >
                <Checkbox>{I18n.t('admin.accept_na_values')}</Checkbox>
              </Form.Item>
            </>
          ) : null
        }
        <Form.Item
          name="disallowLeadAssessorModeration"
          valuePropName="checked"
          label={I18n.t('admin.disallow_lead_assessor_moderation')}
          tooltip={I18n.t('admin.disallow_lead_assessor_moderation_info')}
        >
          <Switch />
        </Form.Item>
      </Fragment>
    )
  }

  if (factorType === 'formula') {
    formFieldBasedOnFactorType = (
      <>
        <Form.Item name="formula" label={I18n.t('admin.scoring_formula')}>
          <LuaEditor />
        </Form.Item>
      </>
    )
  }

  const handleClose = () => {
    onClose()
  }


  const renderTreeNodes = () => {
    if (!groupName || !totalFactors) return null
    return groupName?.map((group) => {
      const { id: groupId, name: groupname } = group

      const groupFactors = totalFactors?.filter(factor => _.isEqual(factor.campaignFactorGroupId, _.toNumber(groupId)))

      return (
        <TreeNode selectable={false} title={groupname}>
          {groupFactors?.map((factor) => {
            const { id: factorId, name: factorName } = factor
            const isModified = dirtyFactors[factorId]
            return (
              <TreeNode
                key={factorId}
                title={factorName}
                selectable
                className={`${styles.factorNode} ${isModified ? styles.modified : ''}`}
              />
            )
          })}
        </TreeNode>
      )
    })
  }


  return (
    <Drawer
      closeIcon={<DirectionalNavigateBackIcon />}
      title={(
        <div className={styles.titleContainer}>
          <span>{title}</span>
          {factorData ? (
            <Button
              type="primary"
              htmlType="button"
              icon={<SaveOutlined />}
              className="ml-auto"
              onClick={() => editFactors?.(form)}
            >
              {I18n.t('admin.scoring_save_all')}
            </Button>
          ) : null}
        </div>
      )}
      open={open}
      width="70%"
      onClose={handleClose}
      destroyOnHidden
    >
      <div className={styles.parent}>
        {factorData ? (
          <div className={styles.tree}>
            <Tree
              showLine
              onSelect={(keys: Key[]) => handleFactorSelect(keys, form)}
              switcherIcon={<DownOutlined />}
              defaultExpandAll
              selectedKeys={[factorData.id]}
            >
              {renderTreeNodes()}
            </Tree>
          </div>
        ) : null}
        <div className={styles.form}>
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
              validateMessages: {
                required: I18n.t('admin.scoring_required_error'),
                pattern: { mismatch: I18n.t('admin.scoring_pattern_error') },
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
                  label={I18n.t('shared.name')}
                  rules={[{
                    required: true,
                    whitespace: true,
                    pattern: /^[a-zA-Z0-9\- ]+$/,
                  }]}
                >
                  <Input maxLength={64} name="campaign_factor_name" />
                </Form.Item>
                <Form.Item name="code" label={I18n.t('shared.code')}>
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
                <Form.Item name="description" label={I18n.t('shared.description')}>
                  <Input.TextArea />
                </Form.Item>
                <Form.Item name="outputType" label={I18n.t('admin.scoring_output_type')}>
                  <Select defaultValue="numeric">
                    {['numeric', 'string'].map(
                      value => <Select.Option key={value} value={value}>{value}</Select.Option>,
                    )}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="factorType"
                  label={I18n.t('shared.type')}
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
                  label={I18n.t('admin.scoring_public')}
                  name="publicVisibility"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                {outputType === 'numeric'
                  ? (
                    <Form.Item label={I18n.t('admin.scoring_ranked')} name="ranked" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  ) : null
            }
                <Form.Item>
                  <Button type="primary" htmlType="submit">{I18n.t('shared.save')}</Button>
                </Form.Item>
              </>
            )}
          </ResourceForm>
        </div>
      </div>
    </Drawer>
  )
}

const alphaNumericWithUnderscore = string => string.trim() // trim leading or trailing whitespace
  .toLowerCase() // convert to lowercase
  .replace(/[^a-z0-9_]/g, '') // remove non-alphanumeric characters expcept underscore
