import React, { useEffect } from 'react'
import {
  Form, Input, Select, Spin, Switch,
} from 'antd'
import { FormInstance } from 'antd/lib/form'
import _ from 'lodash'
import { useResources } from '~/hooks/useResources'
import { Report } from '~/modules/admin/modules/client/core/reports'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { ExternalReportFields } from './ExternalReportFields'

const { TextArea } = Input

const { I18n } = window

const INTERNAL = 'internal'

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


  const assessmentIds = Form.useWatch('assessmentIds', form)
  const provider = Form.useWatch('provider', form)
  const externalReportId = Form.useWatch(['externalSettings', 'reportId'], form)

  const [assessmentCache, setAssessmentCache] = React.useState<Assessment[]>([])

  useEffect(() => {
    setAssessmentCache([...assessmentCache, ...assessments.filter(a => assessmentIds.includes(a.id))])

    // TODO (atanych): we need this setTimeout because of antd form bug
    // more details are here https://github.com/TheTalentEnterprise/psychometrics/pull/3635#discussion_r1354763753
    setTimeout(() => {
      form.setFieldsValue({ provider: getCurrentProvider() })
    })
  }, [assessmentIds, externalReportId])


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
    if (provider === INTERNAL && !externalReportId) return INTERNAL

    return assessmentType
  }


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

      {!dataOnly && (
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
    </>
  )
}
