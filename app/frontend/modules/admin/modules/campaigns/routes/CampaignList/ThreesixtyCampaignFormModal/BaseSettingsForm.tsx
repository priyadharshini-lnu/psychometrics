import {
  useState,
  useCallback,
} from 'react'
import {
  Button,
  Flex,
  Form,
  Input,
  Radio,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd'
import _ from 'lodash'
import { CampaignCreatorSVG } from './CampaignCreatorSVG'
import { STATUSES } from '~/constants/campaign'
import { Assessment } from '~/modules/admin/modules/campaigns/core/list'
import { THREESIXTY_CATEGORY, TYPES as THREESIXTY_TYPES } from '~/modules/admin/constants/threesixtyCampaign'
import styles from './ThreesixtyCampaignFormModal.less'
import { camelizeKeys } from '~/utils/object'
import { useResources } from '~/hooks/useResources'
import { Tag } from '~/modules/admin/core/tags'
import { TaggableResourceType } from '~/modules/admin/components/Resource/TagFilter/constants'
import { LocaleSelectors } from '~/modules/admin/modules/campaigns/components/TranslationLocaleSelectors'
import {
  CampaignNameTranslationReference,
  useLocaleAwareNameFieldSync,
  useCampaignNameTranslations,
} from '../CampaignNameTranslationsFields'

const { I18n } = window
const CURRENT_APP_LOCALE = I18n.locale || I18n.defaultLocale || 'en'

const MAX_TAG_BATCH_SIZE = 100

type Props = {
  projectId: number;
  onFinish:(values) => void;
  onClose:() => void;
  initialSettings: {
    name: string;
    status: string;
    threesixty_type: string;
    threesixty_category: string;
    tagList?: string[];
  } | null
  assessments: Assessment[]
  features: Record<string, boolean>
  isSubmitting?: boolean
}

const BaseSettingsForm = ({
  projectId, onFinish, onClose, initialSettings, assessments, isSubmitting = false, features,
}: Props) => {
  const [form] = Form.useForm()
  const category = Form.useWatch('threesixty_category', form)
  const threesixtyType = Form.useWatch('threesixty_type', form)
  const [isCreate, setIsCreate] = useState((initialSettings
    && initialSettings.threesixty_type === THREESIXTY_TYPES.EMPTY) ?? true)
  const [isPrevious360, setIsPrevious360] = useState((initialSettings
    && initialSettings.threesixty_type === THREESIXTY_TYPES.PREVIOUS_360) ?? false)
  const skillRaterEnabled = camelizeKeys(features ?? {})?.skillRaterEnabled
  const {
    availableLocales: translationLocales,
    editingLocale,
    referenceLocale,
    availableReferenceLocales,
    referenceValue,
    isLoading,
    handleEditingLocaleChange,
    handleReferenceLocaleChange,
  } = useCampaignNameTranslations({ form, projectId, fieldName: 'translated_name' })

  const {
    data: tags, fetch: fetchTags, isLoading: isTagsLoading,
  } = useResources<Tag>('tags', {
    apiConfig: { query: { taggable_resource_type: TaggableResourceType.Campaign } },
  })

  const debouncedFetchTags = useCallback(_.debounce((value) => {
    fetchTags({
      apiConfig: {
        filter: { name_cont: value },
        fields: { tags: ['name'] },
        page: { size: MAX_TAG_BATCH_SIZE },
      },
    })
  }, 300), [])

  const assessmentOptions = assessments.filter(assessment => (category === THREESIXTY_CATEGORY.SKILLS_RATER
    ? assessment.skillRater
    : !assessment.skillRater))

  // Available locales for the form
  const availableLocales = I18n.availableLocales || ['en']
  const localeOptions = availableLocales.map(locale => ({
    label: I18n.t(`languages.${locale}`),
    value: locale,
  }))

  useLocaleAwareNameFieldSync({
    form,
    appLocale: CURRENT_APP_LOCALE,
    editingLocale,
    sourceFieldName: 'name',
    targetFieldName: 'translated_name',
  })

  const handleFinish = (values) => {
    const name = values.name?.trim()
    const translatedName = values.translated_name?.trim()
    const selectedLocale = editingLocale || CURRENT_APP_LOCALE

    onFinish({
      ...values,
      name,
      translated_name: translatedName,
      name_locale: selectedLocale,
    })
  }

  const handleChange = (values) => {
    const { threesixty_type } = values
    if (threesixty_type && threesixty_type !== THREESIXTY_TYPES.STANDARD_360) {
      setIsCreate(true)
    } else if (threesixty_type && threesixty_type === THREESIXTY_TYPES.STANDARD_360) {
      setIsCreate(false)
    }

    if (threesixty_type && threesixty_type === THREESIXTY_TYPES.PREVIOUS_360) {
      setIsPrevious360(true)
    } else if (threesixty_type && threesixty_type !== THREESIXTY_TYPES.PREVIOUS_360) {
      setIsPrevious360(false)
    }
  }

  return (
    <Form
      layout="vertical"
      initialValues={{
        layout: 'vertical',
        name: initialSettings?.name ? initialSettings.name : '',
        status: initialSettings?.status || STATUSES.ACTIVE,
        threesixty_type: initialSettings?.threesixty_type || THREESIXTY_TYPES.EMPTY,
        threesixty_category: initialSettings?.threesixty_category || THREESIXTY_CATEGORY.NORMAL,
        default_assessment_locale: 'en',
        default_report_language: 'en',
        tagList: initialSettings?.tagList || [],
      }}
      form={form}
      className="h-100"
      onFinish={handleFinish}
      onValuesChange={handleChange}
    >
      <Flex vertical className="h-100">
        <Flex flex="auto" className="h-100">
          <Flex gap={8} vertical className="w-100 p-8" style={{ maxWidth: 360 }}>
            <Flex vertical className="w-100">
              <Form.Item
                name="name"
                label={I18n.t('shared.name')}
                rules={[{ required: true, transform: value => value.trim() }]}
              >
                <Input name="threesixty_campaign_name" />
              </Form.Item>
            </Flex>
            <Flex vertical className="w-100">
              <Form.Item
                name="status"
                label={I18n.t('shared.status')}
                required
              >
                <Radio.Group className="ps-4">
                  <Space>
                    <Radio
                      value={STATUSES.ACTIVE}
                    >
                      {I18n.t(`admin.${STATUSES.ACTIVE}`)}
                    </Radio>
                    <Radio
                      value={STATUSES.INACTIVE}
                    >
                      {I18n.t(`admin.${STATUSES.INACTIVE}`)}
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Flex>
            {
              skillRaterEnabled
                && (
                  <Flex vertical className="w-100">
                    <Form.Item
                      name="threesixty_category"
                      label={I18n.t('admin.category')}
                      required
                    >
                      <Radio.Group className="ps-4">
                        <Space>
                          <Radio
                            value={THREESIXTY_CATEGORY.NORMAL}
                          >
                            {I18n.t('admin.normal')}
                          </Radio>
                          <Radio
                            value={THREESIXTY_CATEGORY.SKILLS_RATER}
                          >
                            {I18n.t('admin.skill_rater')}
                          </Radio>
                        </Space>
                      </Radio.Group>
                    </Form.Item>
                  </Flex>
                )
            }
            <Flex vertical className="w-100">
              <Form.Item
                name="threesixty_type"
                label={I18n.t('shared.type')}
                required
              >
                <Radio.Group className="ps-4">
                  <Space>
                    <Radio
                      value={THREESIXTY_TYPES.EMPTY}
                    >
                      {I18n.t('admin.empty')}
                    </Radio>
                    <Radio
                      value={THREESIXTY_TYPES.PREVIOUS_360}
                    >
                      {I18n.t('admin.previous')}
                    </Radio>
                    <Radio value={THREESIXTY_TYPES.STANDARD_360}>
                      {I18n.t('admin.standard')}
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Flex>
            {isPrevious360 ? (
              <Flex vertical className="w-100">
                <Form.Item
                  name="assessment_id"
                  label={I18n.t('admin.assessment')}
                  rules={[{ required: true }]}
                >
                  <Select
                    options={_.map(assessmentOptions, (assessment: Assessment) => ({
                      label: assessment.name,
                      value: assessment.id,
                    }))}
                  />
                </Form.Item>
              </Flex>
            ) : null}

            {/* Default Assessment Locale */}
            {threesixtyType === THREESIXTY_TYPES.EMPTY && (
              <Flex vertical className="w-100">
                <Form.Item
                  name="default_assessment_locale"
                  label={I18n.t(
                    'admin.default_assessment_language',
                  )}
                >
                  <Select
                    placeholder={
                    I18n.t(
                      'admin.select_assessment_language',
                    )}
                    options={localeOptions}
                  />
                </Form.Item>
              </Flex>
            )}

            {/* Default Report Language */}
            {threesixtyType === THREESIXTY_TYPES.EMPTY && (
              <Flex vertical className="w-100">
                <Form.Item
                  name="default_report_language"
                  label={I18n.t(
                    'admin.default_report_language',
                  )}
                >
                  <Select
                    placeholder={I18n.t(
                      'admin.threesixty_base_settings_select_report_language',
                    )}
                    options={localeOptions}
                  />
                </Form.Item>
              </Flex>
            )}
            <Flex vertical className="w-100">
              <Form.Item
                name="tagList"
                label={I18n.t('shared.tags')}
              >
                <Select
                  mode="tags"
                  style={{ width: '100%' }}
                  placeholder={I18n.t('shared.tags')}
                  showSearch={{ filterOption: false, onSearch: debouncedFetchTags }}
                  notFoundContent={isTagsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
                >
                  {tags.map(({ name }) => (
                    <Select.Option key={name} value={name}>{name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Flex>

            <Form.Item label={I18n.t('admin.campaign_name_translations')}>
              <LocaleSelectors
                editingLocale={editingLocale}
                referenceLocale={referenceLocale}
                availableLocales={translationLocales}
                availableNameLocales={availableReferenceLocales}
                onEditingLocaleChange={handleEditingLocaleChange}
                onReferenceLocaleChange={handleReferenceLocaleChange}
                className="mb8"
                vertical
              />
              <Form.Item name="translated_name" noStyle>
                <Input name="threesixty_campaign_translated_name" placeholder={I18n.t('shared.name')} />
              </Form.Item>
            </Form.Item>
            <CampaignNameTranslationReference
              isLoading={isLoading}
              referenceLocale={referenceLocale}
              referenceValue={referenceValue}
            />
          </Flex>
          <Flex
            flex="auto"
            vertical
            className={`${styles.borderLeft} ${styles.background}`}
            justify="center"
            align="center"
          >
            <Flex vertical gap={16} justify="center" align="center">
              <Flex vertical style={{ width: '200px', height: '200px' }} justify="center" align="center">
                <CampaignCreatorSVG />
              </Flex>
              <Flex vertical style={{ maxWidth: '600px' }} justify="center" align="center">
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {I18n.t('admin.threesixity_instructions_creation_title')}
                </Typography.Title>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  {I18n.t(
                    'admin.threesixity_instructions_creation_sub_title',
                  )}
                </Typography.Title>
                <Typography.Paragraph>
                  <ol>
                    <li>
                      {I18n.t(
                        'admin.threesixity_instructions_creation_empty',
                      )}
                    </li>
                    <li>
                      {I18n.t(
                        'admin.threesixity_instructions_creation_standard',
                      )}
                    </li>
                    <li>
                      {I18n.t(
                        'admin.threesixity_instructions_creation_previous',
                      )}
                    </li>
                  </ol>
                </Typography.Paragraph>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex className={`w-100 p-8 ${styles.borderTop}`} gap={8} justify="flex-end">
          <Button key="back" onClick={onClose} disabled={isSubmitting}>
            {I18n.t('shared.cancel')}
          </Button>
          <Button
            key="submit"
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isCreate ? I18n.t('shared.add') : I18n.t('shared.next')}
          </Button>
        </Flex>
      </Flex>
    </Form>
  )
}

export default BaseSettingsForm
