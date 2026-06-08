import React from 'react'
import {
  Drawer, Button,
  Form, Input, Select, Spin,
} from 'antd'
import ResourceForm from '~/components/ResourceForm'
import { useResources } from '~/hooks/useResources'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { DataReport } from './core'
import { LuaEditor } from '~/glint'
import { useResourceContext } from '~/modules/admin/components/Resource'

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
  const {
    data: clients, fetch: fetchClients, isLoading: isClientsLoading,
  } = useResources<Client>('clients')

  const getClients = (): OptionsType[] => {
    if (!dataReport || !dataReport.owner || clients.find(d => dataReport?.owner?.id === d.id)) {
      return clients
    }

    return [...clients, dataReport.owner]
  }

  const createResource = data => resource.createResource(data).then(() => {
    close()
  })

  const updateResource = data => resource.updateResource(data).then(() => {
    close()
  })

  const [form] = Form.useForm()

  return (
    <Drawer open={show} width="70%" onClose={close} destroyOnHidden maskClosable={false}>
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
              name="ownerId"
              label={I18n.t('shared.owner')}
              initialValue={dataReport?.owner?.id || null}
              rules={[{ required: true }]}
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
                {getClients().map(({ id, name }) => (
                  <Select.Option key={id} value={id}>{name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="configuration"
              label={I18n.t('admin.data_reports_configuration')}
              rules={[{ required: true }]}
            >
              <LuaEditor mode="javascript" />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              {dataReport?.id ? I18n.t('shared.update') : I18n.t('shared.create')}
            </Button>
          </>
        )}
      </ResourceForm>
    </Drawer>
  )
}
