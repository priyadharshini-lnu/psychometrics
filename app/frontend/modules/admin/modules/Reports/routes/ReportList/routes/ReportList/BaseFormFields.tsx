import React, { useEffect, useCallback } from 'react'
import {
  Form, Input, Select, Spin, Switch,
} from 'antd'
import { FormInstance } from 'antd/lib/form'
import _ from 'lodash'
import { Tag } from 'modules/admin/core/tags'
import { useResources } from '~/hooks/useResources'
import { Report } from '~/modules/admin/modules/client/core/reports'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { ExternalReportFields } from './ExternalReportFields'
import { TaggableResourceType } from '~/modules/admin/components/Resource/TagFilter/constants'

const { TextArea } = Input

const { I18n } = window

const INTERNAL = 'internal'
const CUSTOM_UPLOAD = 'custom_upload'
const MAX_TAG_BATCH_SIZE = 100

interface Props {
  report?: Report
  form: FormInstance
}

type OptionsType = {
  id: string
  name: string
}

export const BaseFormFields: React.FC<Props> = ({ report, form }) => {
  const { availableLocales } = I18n
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


  const ExternalReportFieldsComponent = ExternalReportFields[getAssessmentType()]

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
          showSearch
          onSearch={(value) => {
            fetchClients({
              apiConfig: { filter: { filterable_fields: value }, fields: { clients: ['name'] } },
            })
          }}
          notFoundContent={isClientsLoading('fetch') ? <Spin size="small" /> : null}
          filterOption={false}
        >
          <Select.Option>TTE</Select.Option>
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
          >
            <Select
              showSearch
              mode="multiple"
              onSearch={(value) => {
                fetchAssessments({
                  apiConfig: { filter: { filterable_fields: value }, fields: { assessments: ['name'] } },
                })
              }}
              notFoundContent={isAssessmentLoading('fetch') ? <Spin size="small" /> : null}
              filterOption={false}
            >
              {getAssessments().map(({ id, name }) => (
                <Select.Option key={id} value={id}>{name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          {ExternalReportFieldsComponent && <ExternalReportFieldsComponent form={form} report={report} />}
        </>
      )}
      <Form.Item
        name="defaultLanguage"
        label={I18n.t('reports.columns.default_language')}
        initialValue={report?.defaultLanguage || 'en'}
      >
        <Select>
          {availableLocales.map(locale => (
            <Select.Option key={locale} value={locale}>{I18n.t(`languages.${locale}`)}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="otherLanguages" label={I18n.t('reports.columns.other_available_languages')}>
        <Select mode="multiple">
          {availableLocales.filter(l => l !== (report?.defaultLanguage || 'en')).map(locale => (
            <Select.Option key={locale} value={locale}>{I18n.t(`languages.${locale}`)}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="tagList"
        label={I18n.t('common.column.tags')}
      >
        <Select
          mode="tags"
          style={{ width: '100%' }}
          placeholder={I18n.t('common.column.tags')}
          showSearch
          onSearch={(value) => {
            debouncedFetchTags(value)
          }}
          notFoundContent={isTagsLoading('fetch') ? <Spin size="small" /> : null}
          filterOption={false}
        >
          {tags.map(({ name }) => (
            <Select.Option key={name} value={name}>{name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  )
}
