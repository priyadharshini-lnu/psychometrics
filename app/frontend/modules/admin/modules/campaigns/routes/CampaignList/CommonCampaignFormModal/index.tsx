import React, {
  useEffect,
  useState,
  useCallback,
} from 'react'
import {
  Form, Input, Select, DatePicker, Row, Col, Alert, Space, Switch, Spin,
} from 'antd'
import _ from 'lodash'
import dayjs from '~/utils/dayjs'
import { STATUSES, TYPES } from '~/constants/campaign'
import ResourceFormModal from '~/components/ResourceFormModal'
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
const { Option } = Select
const CURRENT_APP_LOCALE = I18n.locale || I18n.defaultLocale || 'en'

interface Props {
  projectId: number
  close(): void
  campaign: {
    id: number,
    status: string,
    startDate?: Date,
    endDate?: Date,
    isFixedTime: boolean,
    tagList?: string[],
  }
}

const format = 'YYYY-MM-DD HH:mm'
// Can not select days before today
const disabledDate = current => current && current < dayjs().startOf('day')

const notices = {
  active: I18n.t('admin.campaigns_form_active_notice'),
  inactive: I18n.t('admin.campaigns_form_inactive_notice'),
}

const MAX_TAG_BATCH_SIZE = 100

type FormContentProps = {
  isEdit: boolean
  notice: string | null
  tags: Tag[]
  isTagsFetchLoading: boolean
  debouncedFetchTags: (value: string) => void
  availableLocales: string[]
  editingLocale: string
  referenceLocale?: string
  availableReferenceLocales: string[]
  referenceValue: string
  isTranslationLoading: boolean
  handleEditingLocaleChange: (locale: string) => void
  handleReferenceLocaleChange: (locale?: string) => void
}

const FormContent: React.FC<FormContentProps> = ({
  isEdit,
  notice,
  tags,
  isTagsFetchLoading,
  debouncedFetchTags,
  availableLocales,
  editingLocale,
  referenceLocale,
  availableReferenceLocales,
  referenceValue,
  isTranslationLoading,
  handleEditingLocaleChange,
  handleReferenceLocaleChange,
}) => (
  <>
    <Form.Item
      name="name"
      label={I18n.t('shared.name')}
      rules={[{ required: true }]}
    >
      <Input name="common_campaign_name" />
    </Form.Item>
    <Form.Item
      name="status"
      label={I18n.t('shared.status')}
      required
    >
      <Select>
        {_.map(STATUSES, (status: string) => (
          <Option key={status} value={status}>
            {I18n.t(`admin.campaigns_filters_${status}`)}
          </Option>
        ))}
      </Select>
    </Form.Item>
    <Row gutter={12}>
      <Col span={12}>
        <Form.Item
          name="startDate"
          label={I18n.t('admin.dates_start')}
        >
          <DatePicker showTime format={format} disabledDate={disabledDate} className="w-100" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name="endDate"
          label={I18n.t('admin.dates_end')}
        >
          <DatePicker showTime format={format} disabledDate={disabledDate} className="w-100" />
        </Form.Item>
      </Col>
    </Row>
    <Form.Item
      name="practiceCampaign"
      valuePropName="checked"
      label={I18n.t('admin.campaigns_form_practice_campaign')}
      extra={isEdit ? I18n.t('admin.only_editable_on_create') : ''}
    >
      <Switch disabled={isEdit} />
    </Form.Item>
    <Form.Item
      name="tagList"
      label={I18n.t('shared.tags')}
    >
      <Select
        mode="tags"
        style={{ width: '100%' }}
        placeholder={I18n.t('shared.tags')}
        showSearch={{ filterOption: false, onSearch: debouncedFetchTags }}
        notFoundContent={isTagsFetchLoading ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
      >
        {tags.map(({ name }) => (
          <Select.Option key={name} value={name}>{name}</Select.Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item label={I18n.t('admin.campaign_name_translations')}>
      <LocaleSelectors
        editingLocale={editingLocale}
        referenceLocale={referenceLocale}
        availableLocales={availableLocales}
        availableNameLocales={availableReferenceLocales}
        onEditingLocaleChange={handleEditingLocaleChange}
        onReferenceLocaleChange={handleReferenceLocaleChange}
        className="mb8"
      />
      <Form.Item name="translated_name" noStyle>
        <Input name="common_campaign_translated_name" placeholder={I18n.t('shared.name')} />
      </Form.Item>
    </Form.Item>
    <CampaignNameTranslationReference
      isLoading={isTranslationLoading}
      referenceLocale={referenceLocale}
      referenceValue={referenceValue}
    />
    <Space>
      {notice && <Alert message="Note" description={notice} type="warning" showIcon />}
    </Space>
    <Form.Item name="type" noStyle>
      <Input type="hidden" />
    </Form.Item>
  </>
)

const CommonCampaignFormModal: React.FC<Props> = ({
  projectId,
  close,
  campaign,
}) => {
  const [form] = Form.useForm()
  const [notice, setNotice] = useState<string | null>(null)

  const {
    data: tags, fetch: fetchTags, isLoading,
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

  useEffect(() => {
    if (campaign && campaign.isFixedTime) setNotice(notices[campaign.status])
  }, [])

  const isEdit = !!campaign?.id

  const {
    availableLocales,
    editingLocale,
    referenceLocale,
    availableReferenceLocales,
    referenceValue,
    isLoading: isTranslationLoading,
    handleEditingLocaleChange,
    handleReferenceLocaleChange,
  } = useCampaignNameTranslations({
    form,
    projectId,
    campaignId: campaign?.id,
    fieldName: 'translated_name',
  })

  useLocaleAwareNameFieldSync({
    form,
    appLocale: CURRENT_APP_LOCALE,
    editingLocale,
    sourceFieldName: 'name',
    targetFieldName: 'translated_name',
  })

  const transformValues = (values) => {
    const name = values.name?.trim()
    const translatedName = values.translated_name?.trim()
    const selectedLocale = editingLocale || CURRENT_APP_LOCALE

    return {
      ...values,
      name,
      translated_name: translatedName,
      name_locale: selectedLocale,
      startDate: values.startDate && values.startDate.format(),
      endDate: values.endDate && values.endDate.format(),
    }
  }

  const handleValuesChange = (changedValues: Record<string, unknown>, allValues: { status, startDate, endDate }) => {
    if (allValues.status === 'active' && allValues.endDate) {
      setNotice(notices.active)
    } else if (allValues.status === 'inactive' && allValues.startDate) {
      setNotice(notices.inactive)
    } else {
      setNotice(null)
    }
  }

  return (
    <ResourceFormModal
      resourceName="campaign"
      readableResourceName={I18n.t('admin.campaigns_form_campaign')}
      resourceBaseUrl={`/administration/projects/${projectId}/new_campaigns`}
      resource={campaign}
      showSuccessMessages
      close={close}
      modalProps={{ width: 550 }}
      storeManager={{ form }}
      formProps={{
        initialValues: { status: STATUSES.ACTIVE, type: TYPES.COMMON, tagList: campaign?.tagList || [] },
        onValuesChange: handleValuesChange,
      }}
      transformValues={transformValues}
    >
      {() => (
        <FormContent
          isEdit={isEdit}
          notice={notice}
          tags={tags}
          isTagsFetchLoading={isLoading('fetch')}
          debouncedFetchTags={debouncedFetchTags}
          availableLocales={availableLocales}
          editingLocale={editingLocale}
          referenceLocale={referenceLocale}
          availableReferenceLocales={availableReferenceLocales}
          referenceValue={referenceValue}
          isTranslationLoading={isTranslationLoading}
          handleEditingLocaleChange={handleEditingLocaleChange}
          handleReferenceLocaleChange={handleReferenceLocaleChange}
        />
      )}
    </ResourceFormModal>
  )
}

export default CommonCampaignFormModal
