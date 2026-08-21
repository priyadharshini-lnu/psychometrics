import React, { useMemo, useEffect, useState } from 'react'
import {
  Drawer, Button,
  Form, Input, Select, Spin,
} from '@thetalententerprise/glint'
import ResourceForm from '~/components/ResourceForm'
import { useResources } from '~/hooks/useResources'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { DataReport } from './core'
import { useResourceContext } from '~/modules/admin/components/Resource'
import {
  REPORT_TYPE_KEYS,
  getReportTypeDefinition,
} from './components/ReportTypeConfigs'

const { I18n } = window

interface Props {
  dataReport?: DataReport
  close(): void
  show: boolean
}

type OptionsType = {
  id: string
  name: string
}

export const DataReportForm: React.FC<Props> = ({
  dataReport,
  close,
  show,
}) => {
  const { resource } = useResourceContext()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const selectedOwnerId = Form.useWatch('ownerId', form) as string | null
  const selectedReportType = Form.useWatch('reportType', form) as string
  const selectedScope = Form.useWatch('scope', form) as string

  const {
    data: clients, fetch: fetchClients, isLoading: isClientsLoading,
  } = useResources<Client>('clients')

  const getClients = (): OptionsType[] => {
    if (!dataReport || !dataReport.owner || clients.find(d => dataReport?.owner?.id === d.id)) {
      return clients
    }
    return [...clients, dataReport.owner]
  }

  const parsedConfiguration = useMemo(() => {
    if (!dataReport?.configuration) return null
    try {
      return JSON.parse(dataReport.configuration)
    } catch {
      return null
    }
  }, [dataReport?.configuration])

  const reportTypeDefinition = getReportTypeDefinition(selectedReportType)
  const uiRules = reportTypeDefinition?.uiRules

  const defaultScope = uiRules?.defaultScope
  const scopeOptions = uiRules?.scopeOptions ?? ['client', 'global']

  useEffect(() => {
    if (defaultScope) {
      form.setFieldsValue({ scope: defaultScope })
    }
  }, [defaultScope, form])

  const createResource = async (data: Record<string, unknown>) => {
    if (submitting) return
    setSubmitting(true)
    try {
      const processedData = reportTypeDefinition?.processConfiguration(data) ?? data
      await resource.createResource(processedData)
      close()
    } finally {
      setSubmitting(false)
    }
  }

  const updateResource = async (data: Record<string, unknown>) => {
    if (submitting) return
    setSubmitting(true)
    try {
      const processedData = reportTypeDefinition?.processConfiguration(data) ?? data
      await resource.updateResource({
        ...processedData,
        id: dataReport?.id as string,
      })
      close()
    } finally {
      setSubmitting(false)
    }
  }

  const ConfigComponent = reportTypeDefinition?.component

  const shouldHideOwner = selectedScope === 'global'

  return (
    <Drawer open={show} size="70%" onClose={close} destroyOnHidden>
      <ResourceForm
        resourceName="data_reports"
        readableResourceName={I18n.t('admin.data_reports_form_name')}
        resource={dataReport}
        showSuccessMessages
        storeManager={{ form }}
        formProps={{ labelAlign: 'left', preserve: false }}
        request={{ createResource, updateResource }}
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
              name="reportType"
              label={I18n.t('admin.report_type')}
              initialValue={dataReport?.reportType || 'json_data_report'}
              rules={[{ required: true }]}
            >
              <Select
                {...({
                  showSearch: true,
                  optionFilterProp: 'label',
                } as unknown as Record<string, unknown>)}
                placeholder={I18n.t('admin.select_report_type')}
                options={REPORT_TYPE_KEYS.map(key => ({
                  value: key,
                  label: I18n.t(`admin.report_types.${key}`),
                }))}
              />
            </Form.Item>
            <Form.Item
              name="scope"
              label={I18n.t('admin.scope')}
              initialValue={dataReport?.scope || 'client'}
              rules={[{ required: true }]}
            >
              <Select
                disabled={Boolean(dataReport?.id) || scopeOptions.length === 1}
                options={[
                  ...(scopeOptions.includes('client')
                    ? [{ value: 'client', label: I18n.t('admin.scope_client') }]
                    : []),
                  ...(scopeOptions.includes('global')
                    ? [{ value: 'global', label: I18n.t('admin.scope_global') }]
                    : []),
                ]}
              />
            </Form.Item>

            {!shouldHideOwner && (
              <Form.Item
                name="ownerId"
                label={I18n.t('common.column.owner')}
                initialValue={dataReport?.owner?.id || null}
                rules={[{ required: true }]}
              >
                <Select
                  disabled={Boolean(dataReport?.id)}
                  {...({
                    showSearch: {
                      filterOption: false,
                      onSearch: (value: string) => {
                        fetchClients({
                          apiConfig: {
                            filter: { filterable_fields: value },
                            fields: { clients: ['name'] },
                          },
                        })
                      },
                    },
                  } as unknown as Record<string, unknown>)}
                  notFoundContent={
                    isClientsLoading('fetch')
                      ? <Spin size="small" />
                      : I18n.t('shared.no_results_found')
                  }
                  options={getClients().map(({ id, name }) => ({
                    value: id,
                    label: name,
                  }))}
                />
              </Form.Item>
            )}
            {ConfigComponent && (
              <ConfigComponent
                form={form}
                ownerId={selectedOwnerId}
                scope={selectedScope as 'client' | 'global'}
                parsedConfiguration={parsedConfiguration}
              />
            )}
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              disabled={submitting}
            >
              {dataReport?.id ? I18n.t('shared.update') : I18n.t('shared.create')}
            </Button>
          </>
        )}
      </ResourceForm>
    </Drawer>
  )
}
