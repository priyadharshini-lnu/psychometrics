import React from 'react'
import {
  Form, Input, App,
  Select,
  Spin,
} from 'antd'

import { useResourceContext } from '~/modules/admin/components/Resource'
import { Report, ReportTR } from '~/modules/admin/modules/client/core/reports'

import ResourceFormModal from '~/components/ResourceFormModal'
import { useResources } from '~/hooks/useResources'
import { Client } from '~/modules/admin/modules/client/core/clients'

const { I18n } = window


type OptionsType = {
  id: string
  name: string
}

interface Props {
  report: Report
  close(): void
}

type RequestFileds = {
  name: string
}

const CopyReportFormModal: React.FC<Props> = ({
  report, close,
}) => {
  const { message } = App.useApp()
  const { resource } = useResourceContext<Report>()


  const copy = (values: RequestFileds) => resource.memberAction({
    id: report.id,
    action: 'copy',
    method: 'post',
    updateStore: true,
    responseType: ReportTR,
    body: values,
  }).then((response: Report) => {
    resource.setMeta({ ...resource.meta, recordCount: resource.meta?.recordCount ? resource.meta?.recordCount + 1 : 0 })
    message.success(I18n.t('reports.actions.copy.success_message', { name: response.name }))
  })

  const {
    data: clients, fetch: fetchClients, isLoading: isClientsLoading,
  } = useResources<Client>('clients')

  const getClients = (): OptionsType[] => {
    if (!report || !report.owner || clients.find(d => report?.owner?.id === d.id)) {
      return clients
    }

    return [...clients, report.owner]
  }

  return (
    <ResourceFormModal
      resourceName="assessments"
      title={I18n.t('administration.reports.copy.copy_report')}
      readableResourceName={I18n.t('administration.reports.copy.copy_report')}
      close={close}
      scrollToFirstError
      request={{ createResource: copy }}
      modalProps={{ width: 550 }}
      formProps={{ initialValues: { name: `${report.name} - ${I18n.t('administration.reports.copy.copy')}` } }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('administration.reports.copy.name')}
            rules={[{ required: true, transform: value => value.trim() }]}
          >
            <Input name="report_name" />
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
        </>
      )}
    </ResourceFormModal>
  )
}

export default CopyReportFormModal
