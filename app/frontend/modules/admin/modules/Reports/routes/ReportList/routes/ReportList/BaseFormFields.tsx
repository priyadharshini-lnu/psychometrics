import React, { useEffect, useCallback, useState } from 'react'
import {
  Form, Input, Select, Spin, Switch, Modal, Button, Tooltip, Flex, Alert, Checkbox,
} from 'antd'
import { FormInstance } from 'antd/es/form'
import _ from 'lodash'
import { Tag } from 'modules/admin/core/tags'
import { connect } from 'react-redux'
import { EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import { Report } from '~/modules/admin/modules/client/core/reports'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { ExternalReportFields } from './ExternalReportFields'
import { TaggableResourceType } from '~/modules/admin/components/Resource/TagFilter/constants'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'

const { TextArea } = Input

const { I18n } = window

const INTERNAL = 'internal'
const CUSTOM_UPLOAD = 'custom_upload'
const MAX_TAG_BATCH_SIZE = 100

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
)

interface Props {
  report?: Report
  form: FormInstance
  currentUser
}

type OptionsType = {
  id: string
  name: string
}

const BaseFormFieldsComp: React.FC<Props> = ({ report, form, currentUser }) => {
  const { availableLocales } = I18n
  const [defaultLangForm] = Form.useForm()
  const isEditForm = !!report
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false)
  const {
    data: clients, fetch: fetchClients, isLoading: isClientsLoading,
  } = useResources<Client>('clients')
  const {
    data: assessments, fetch: fetchAssessments, isLoading: isAssessmentLoading,
  } = useResources<Assessment>('assessments', {
    apiConfig: {
      fields: {
        assessments: ['name', 'type'],
      },
    },
  })
  const {
    data: tags, fetch: fetchTags, isLoading: isTagsLoading,
  } = useResources<Tag>('tags', { apiConfig: { query: { taggable_resource_type: TaggableResourceType.Report } } })

  const assessmentIds = Form.useWatch('assessmentIds', form)
  const provider = Form.useWatch('provider', form)
  const externalReportId = Form.useWatch(['externalSettings', 'reportId'], form)
  const defaultLanguage = Form.useWatch('defaultLanguage', form)

  const [assessmentCache, setAssessmentCache] = React.useState<Assessment[]>([])
  const [isCustomUpload, setIsCustomUpload] = React.useState(false || report?.provider === CUSTOM_UPLOAD)

  useEffect(() => {
    setAssessmentCache([...assessmentCache, ...assessments.filter(a => assessmentIds.includes(a.id))])

    // TODO (atanych): we need this setTimeout because of antd form bug
    // more details are here https://github.com/TheTalentEnterprise/psychometrics/pull/3635#discussion_r1354763753
    setTimeout(() => {
      form.setFieldsValue({ provider: getCurrentProvider() })
    }, 50)
  }, [assessmentIds, externalReportId, isCustomUpload])

  const getClients = (): OptionsType[] => {
    if (!report || !report.owner || clients.find(d => report?.owner?.id === d.id)) {
      return clients
    }

    return [...clients, report.owner]
  }

  const getAssessments = (): OptionsType[] => {
    if (!report) return assessments

    const reportAssessmentIds = report.assessments.map(a => a?.id)

    const filteredAssessments = report.assessments.length
      ? assessments.filter(a => !reportAssessmentIds.includes(a.id))
      : assessments
    return [...filteredAssessments, ...report.assessments.map(a => ({ id: a.id, name: a.name }))]
  }

  const dataOnly = Form.useWatch('dataOnly', form)

  const getAssessmentType = () => {
    if (!assessmentIds?.length && isCustomUpload) return CUSTOM_UPLOAD
    if (!assessmentIds?.length) return INTERNAL

    const types = _.uniq([...assessmentCache, ...assessments, ...(report?.assessments || [])]
      .filter(a => assessmentIds.includes(a.id)).map(a => a.type))
    if (types.length > 1) return INTERNAL

    if (types[0] === 'common') return INTERNAL

    return types[0]
  }

  const getCurrentProvider = () => {
    const assessmentType = getAssessmentType()
    if (assessmentType === 'hogan' && !externalReportId) return INTERNAL
    if (assessmentType === 'saville' && !externalReportId) return INTERNAL
    if (assessmentType === 'mhs' && !externalReportId) return INTERNAL
    if (provider === INTERNAL && !isCustomUpload && !externalReportId) return INTERNAL

    return assessmentType
  }

  const debouncedFetchTags = useCallback(_.debounce((value) => {
    fetchTags({
      apiConfig: {
        filter: { name_cont: value },
        fields: { tags: ['name'] },
        page: {
          size: MAX_TAG_BATCH_SIZE,
        },
      },
    })
  }, 300), [])

  const handleLanguageChange = useCallback(
    _.debounce((value) => {
      const updatedOtherLanguages = (form.getFieldValue('otherLanguages') || []).filter(
        lang => lang !== value,
      )

      form.setFieldsValue({ defaultLanguage: value, otherLanguages: updatedOtherLanguages })
    }, 100),
    [form],
  )

  const ExternalReportFieldsComponent = ExternalReportFields[getAssessmentType()]

  const showLanguageModal = () => {
    defaultLangForm.setFieldValue('tempDefaultLanguage', defaultLanguage || 'en')
    setIsLanguageModalVisible(true)
  }

  const handleModalCancel = () => {
    setIsLanguageModalVisible(false)
    defaultLangForm.resetFields()
  }

  const handleModalOk = () => {
    const tempDefaultLanguage = defaultLangForm.getFieldValue('tempDefaultLanguage')
    const updatedOtherLanguages = (form.getFieldValue('otherLanguages') || []).filter(
      lang => lang !== tempDefaultLanguage,
    )

    form.setFieldsValue({
      defaultLanguage: tempDefaultLanguage,
      otherLanguages: updatedOtherLanguages,
    })

    setIsLanguageModalVisible(false)
  }

  return (
    <>
      <Form.Item
        name="name"
        label={I18n.t('common.column.name')}
        rules={[{ required: true }]}
      >
        <Input name="report_name" />
      </Form.Item>
      <Form.Item name="provider" className="hidden"><Input /></Form.Item>
      <Form.Item
        name="description"
        label={I18n.t('common.column.description')}
      >
        <TextArea />
      </Form.Item>
      <Form.Item
        name="ownerId"
        label={I18n.t('common.column.owner')}
        initialValue={report?.owner?.id || null}
      >
        <Select
          showSearch={{
            filterOption: false,
            onSearch: (value) => {
              fetchClients({
                apiConfig: { filter: { filterable_fields: value }, fields: { clients: ['name'] } },
              })
            },
          }}
          notFoundContent={isClientsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
        >
          {isSuperAdmin(currentUser) && <Select.Option>TTE</Select.Option>}
          {getClients().map(({ id, name }) => (
            <Select.Option key={id} value={id}>{name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        valuePropName="checked"
        name="dataOnly"
        label={I18n.t('reports.columns.data_only')}
      >
        <Switch />
      </Form.Item>
      <Form.Item
        valuePropName="checked"
        label={I18n.t('reports.fields.provider.custom_upload')}
      >
        <Switch onChange={(value) => { setIsCustomUpload(value) }} checked={isCustomUpload} />
      </Form.Item>

      {!(isCustomUpload || dataOnly) && (
        <>
          <Form.Item
            name="assessmentIds"
            label={I18n.t('common.column.assessments')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch={{
                filterOption: false,
                onSearch: (value) => {
                  fetchAssessments({
                    apiConfig: { filter: { filterable_fields: value }, fields: { assessments: ['name'] } },
                  })
                },
              }}
              mode="multiple"
              notFoundContent={isAssessmentLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
            >
              {getAssessments().map(({ id, name }) => (
                <Select.Option key={id} value={id}>{name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          {ExternalReportFieldsComponent && <ExternalReportFieldsComponent form={form} report={report} />}
        </>
      )}
      <Form.Item label={I18n.t('reports.columns.default_language')}>
        <Flex gap={4}>
          <Form.Item
            name="defaultLanguage"
            style={{ flex: '1 1 auto' }}
          >
            <Select
              disabled={isEditForm}
              onChange={value => handleLanguageChange(value)}
            >
              {availableLocales
                .filter(locale => locale)
                .map(locale => (
                  <Select.Option key={locale} value={locale}>
                    {I18n.t(`languages.${locale}`)}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          {isEditForm && (
            <Tooltip title={I18n.t('admin.reports_edit_default_language_tooltip')}>
              <Button
                icon={<EditOutlined />}
                onClick={showLanguageModal}
                type="text"
              />
            </Tooltip>
          )}
        </Flex>
      </Form.Item>
      <Form.Item name="otherLanguages" label={I18n.t('reports.columns.other_available_languages')}>
        <Select
          mode="multiple"
          showSearch
          filterOption={(input, option) => {
            if (!option?.children) return false
            const label = option.children.toString().toLowerCase()
            const value = option.value?.toString().toLowerCase() || ''
            const searchInput = input.toLowerCase()
            return label.includes(searchInput) || value.includes(searchInput)
          }}
        >
          {availableLocales
            .filter(locale => locale && locale !== form.getFieldValue('defaultLanguage'))
            .map(locale => (
              <Select.Option key={locale} value={locale}>
                {I18n.t(`languages.${locale}`)}
              </Select.Option>
            ))}
        </Select>
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
          notFoundContent={isTagsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
        >
          {tags.map(({ name }) => (
            <Select.Option key={name} value={name}>{name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Modal
        title={I18n.t('admin.reports_edit_default_language_title')}
        open={isLanguageModalVisible}
        onOk={() => defaultLangForm.submit()}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={defaultLangForm} onFinish={handleModalOk}>
          <Form.Item
            name="tempDefaultLanguage"
          >
            <Select>
              {availableLocales
                .filter(locale => locale)
                .map(locale => (
                  <Select.Option key={locale} value={locale}>
                    {I18n.t(`languages.${locale}`)}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Alert
            message={I18n.t('admin.reports_edit_default_language_warning_title')}
            description={(
              <ul style={{ paddingLeft: '20px' }}>
                <li>{I18n.t('admin.reports_edit_default_language_warning_description_li_1')}</li>
                <li>{I18n.t('admin.reports_edit_default_language_warning_description_li_2')}</li>
                <li>{I18n.t('admin.reports_edit_default_language_warning_description_li_3')}</li>
              </ul>
            )}
            type="warning"
            className="mb-6"
          />
          <Form.Item
            valuePropName="checked"
            name="confirmation"
            rules={[{ required: true }]}
          >
            <Checkbox style={{ display: 'flex', alignItems: 'flex-start' }}>
              {I18n.t('admin.reports_edit_default_language_agreement')}
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export const BaseFormFields = connecter(BaseFormFieldsComp)
