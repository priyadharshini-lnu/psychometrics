import { useEffect, useState } from 'react'
import {
  Avatar, Button, Form, Input, Upload, Select, InputNumber,
  Space, Flex, Radio, Typography, Tooltip,
} from 'antd'
import { useDispatch } from 'react-redux'
import { UploadChangeParam, UploadFile } from 'antd/es/upload/interface'
import omit from 'lodash/omit'
import get from 'lodash/get'
import { useParams } from 'react-router-dom'
import { UploadOutlined, DeleteOutlined, QuestionCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Factor, uploadFiles } from '~/modules/admin/modules/campaigns/core/factors'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ResourceFormModal from '~/components/ResourceFormModal'
import { addModificationTypes } from './utils/modificationTypes'
import { SafeHTML } from '~/components/SafeHTML'
import { ScoringStrategyEditor, PercentageCheckbox, SubfactorNormScoreCheckbox } from './ScoringStrategyEditor'
import { ScoreDefinitions } from './ScoreDefinitions'
import { generateScoreDefinitionsFromRange } from './utils/scoreDefinitions'

type Props = {
  close(): void
  factor?: Factor
}

type FormValues = Partial<Factor> & {
  removeIcon?: boolean
  subFactors?: unknown[]
}

const { I18n } = window

const SCORING_STRATEGIES = [
  'questions',
  'sub_factor_questions',
  'sub_factors_average',
  'sub_factors_conditional_average',
  'questions_sum',
  'sub_factor_questions_sum',
  'external_score',
  'questions_percentage',
  'sub_factors_sum',
  'custom_formula',
]

const INDICATOR_SUPPORTED_STRATEGIES = [
  'sub_factors_average',
  'sub_factors_conditional_average',
  'sub_factors_sum',
]

const PARENT_FACTOR_STRATEGIES = [
  'sub_factors_average',
  'sub_factors_conditional_average',
  'sub_factors_sum',
  'sub_factor_questions',
  'sub_factor_questions_sum',
]

export const FactorsFormModal: React.FC<Props> = ({ close, factor }) => {
  const dispatch = useDispatch()

  const { resource } = useResourceContext<Factor>()
  const [form] = Form.useForm()
  const { dimensionId } = useParams()

  const scoringStrategy = Form.useWatch(['scoringStrategy'], form)
  const scoreMin = Form.useWatch(['scoreMin'], form)
  const scoreMax = Form.useWatch(['scoreMax'], form)
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [removeIcon, setRemoveIcon] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [originalSubFactors] = useState<Factor[]>(() => get(factor, 'subFactors', []) as Factor[])

  const subFactors = Form.useWatch('subFactors', { form }) || []
  const childrenFactorType = Form.useWatch(['childFactorType'], form)
  const hasChildren = subFactors.length > 0

  const hideScoreRange = ['external_score', 'custom_formula'].includes(scoringStrategy)
  const hideScoreDefinitions = hideScoreRange || PARENT_FACTOR_STRATEGIES.includes(scoringStrategy)

  const handleUploadChange = (info: UploadChangeParam<UploadFile>) => {
    setFileList(info.fileList)
    if (info.fileList.length > 0 && info.fileList[0].originFileObj) {
      setIconFile(info.fileList[0].originFileObj as File)
    } else {
      setIconFile(null)
    }
  }

  const createFactors = async (data: FormValues) => {
    const subFactors = data.subFactors || []
    const subFactorsWithTypes = addModificationTypes(subFactors as Factor[], [])

    const attributes = omit(data, ['subFactors'])
    const createAttrs = {
      ...attributes,
      factorsSubFactors: subFactorsWithTypes,
    }


    return resource.createResource(createAttrs as unknown as Factor).then((factor) => {
      if (iconFile) {
        const fd = new FormData()
        fd.append('icon', iconFile)
        dispatch(uploadFiles(dimensionId as string, factor.id, fd))
      }
    })
  }

  const updateFactors = async (data: FormValues) => {
    const subFactors = data.subFactors || []
    const subFactorsWithTypes = addModificationTypes(subFactors as Factor[], originalSubFactors)

    const attributes = omit(data, ['subFactors'])
    const factorId = factor?.id

    if (!factorId) return Promise.reject(new Error('Factor ID is required for update'))

    const updateAttributes: Record<string, unknown> = {
      ...attributes,
      factorsSubFactors: subFactorsWithTypes,
    }

    // Only send purgeIcon when true (FormData converts booleans to strings)
    if (iconFile) {
      const fd = new FormData()
      fd.append('icon', iconFile)
      dispatch(uploadFiles(dimensionId as string, factor?.id, fd))
    } else if (removeIcon) {
      const fd = new FormData()
      fd.append('purge_icon', 'true')
      dispatch(uploadFiles(dimensionId as string, factor?.id, fd))
    }

    return resource.updateResource({ ...updateAttributes, id: factorId } as unknown as Factor)
  }

  useEffect(() => {
    const values: { usePercentage?: boolean | null, scaleMin?: number | null, scaleMax?: number | null } = {}
    if (scoringStrategy !== 'sub_factor_questions_sum' && scoringStrategy !== 'questions_sum') {
      values.usePercentage = false
    }
    if (scoringStrategy !== 'questions_percentage') {
      values.scaleMin = null
      values.scaleMax = null
    }

    form.setFieldsValue(values)
  }, [scoringStrategy])

  return (
    <ResourceFormModal
      resourceName="factors"
      resource={factor}
      readableResourceName={I18n.t('admin.factors_index_title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      formProps={{ preserve: false }}
      scrollToFirstError
      modalProps={{ width: 900 }}
      transformValues={(values: {}) => {
        const formValues = form.getFieldsValue(true)

        return {
          ...values,
          dimensionId,
          factorsSubFactors: formValues.subFactors,
        }
      }}
      request={{ createResource: createFactors, updateResource: updateFactors }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('shared.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="code"
            rules={[{ required: true }]}
            label={I18n.t('shared.code')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label={I18n.t('shared.description')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="scoringStrategy"
            label={(
              <span>
                <span className="mr4">{I18n.t('admin.factors_index_scoring_strategy')}</span>
                <Tooltip
                  title={
                    <SafeHTML html={I18n.t('admin.factors_form_scoring_strategies_tip')} />
                  }
                >
                  <span><QuestionCircleOutlined /></span>
                </Tooltip>
              </span>
            )}
            rules={[{ required: true }]}
          >
            <Select>
              {SCORING_STRATEGIES.map(strategy => (
                <Select.Option value={strategy}>
                  {I18n.t(`admin.${strategy}`)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <PercentageCheckbox strategy={scoringStrategy} />
          <SubfactorNormScoreCheckbox strategy={scoringStrategy} />

          {!hideScoreRange && (
            <Flex gap="middle">
              <Form.Item
                label={I18n.t('admin.score_min')}
                name="scoreMin"
              >
                <InputNumber min={1} max={10} />
              </Form.Item>
              <Form.Item
                label={I18n.t('admin.score_max')}
                name="scoreMax"
              >
                <InputNumber min={1} max={10} />
              </Form.Item>
            </Flex>
          )}

          {!hideScoreDefinitions
            && scoreMin !== null
            && scoreMax !== null
            && scoreMin !== undefined
            && scoreMax !== undefined
            && (
              <ScoreDefinitions
                scoreDefinitions={generateScoreDefinitionsFromRange(
                  scoreMin,
                  scoreMax,
                  get(factor, 'scoreDefinitions', []) as Array<{ score: number; definition: string }>,
                )}
                form={form}
              />
            )
          }

          {INDICATOR_SUPPORTED_STRATEGIES.includes(scoringStrategy) && (
            <div className="mtm">
              <Form.Item name="childFactorType" label={I18n.t('admin.children_factor_type')}>
                <Radio.Group>
                  <Radio value="regular" disabled={hasChildren && childrenFactorType !== 'regular'}>
                    Sub Factor
                  </Radio>
                  <Radio value="indicator" disabled={hasChildren && childrenFactorType !== 'indicator'}>
                    Indicator
                  </Radio>
                </Radio.Group>
              </Form.Item>
              {hasChildren && (
                <Typography.Text type="secondary">
                  {I18n.t('admin.remove_children_to_change_type')}
                </Typography.Text>
              )}
            </div>
          )}

          <ScoringStrategyEditor strategy={scoringStrategy} form={form} childrenFactorType={childrenFactorType} />
          <Form.Item
            name="precision"
            label={I18n.t('admin.factors_index_precision')}
          >
            <InputNumber min={0} max={6} />
          </Form.Item>
          <Form.Item
            label={I18n.t('shared.icon')}
          >
            <Space orientation="vertical">
              {(factor?.iconUrl) && !removeIcon && (
                <Space>
                  <Avatar src={factor.iconUrl} size={64} shape="square" />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setRemoveIcon(true)}
                  >
                    {I18n.t('shared.delete')}
                  </Button>
                </Space>
              )}
              <Upload
                listType="picture"
                maxCount={1}
                accept=".jpg, .png, .jpeg, |image/*"
                beforeUpload={() => false}
                fileList={fileList}
                onChange={handleUploadChange}
              >
                <Button icon={<UploadOutlined />}>{I18n.t('assessments.upload')}</Button>
              </Upload>
            </Space>
          </Form.Item>

          <Form.Item name="dimensionId" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="subFactors" hidden>
            <Input />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
