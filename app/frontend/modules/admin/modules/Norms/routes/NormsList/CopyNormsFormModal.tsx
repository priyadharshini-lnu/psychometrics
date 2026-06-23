import React from 'react'
import {
  Form, Input, App,
  Select,
  Spin,
} from 'antd'

import { useResourceContext } from '~/modules/admin/components/Resource'
import { NormTR, Norm } from '~/modules/admin/modules/client/core/norms'

import ResourceFormModal from '~/components/ResourceFormModal'
import { useResources } from '~/hooks/useResources'
import { Client } from '~/modules/admin/modules/client/core/clients'


type OptionsType = {
  id: string
  name: string
}

const { I18n } = window

interface Props {
  norm: Norm
  close(): void
}

type RequestFileds = {
  name: string
}

const CopyNormsFormModal: React.FC<Props> = ({
  norm, close,
}) => {
  const { message } = App.useApp()
  const { resource } = useResourceContext<Norm>()

  const copy = (values: RequestFileds) => resource.memberAction({
    id: norm.id,
    action: 'copy',
    method: 'post',
    updateStore: true,
    responseType: NormTR,
    body: values,
  }).then((response: Norm) => {
    resource.setMeta({ ...resource.meta, recordCount: resource.meta?.recordCount ? resource.meta?.recordCount + 1 : 0 })
    message.success(I18n.t('admin.norms_copy_successfully', { name: response.name }))
  })

  const {
    data: clients, fetch: fetchClients, isLoading: isClientsLoading,
  } = useResources<Client>('clients')

  const getClients = (): OptionsType[] => {
    if (!norm || !norm.owner || clients.find(d => norm?.owner?.id === d.id)) {
      return clients
    }
    return [...clients, norm.owner]
  }

  return (
    <ResourceFormModal
      resourceName="norm"
      title={I18n.t('admin.norms_sidebar_copy')}
      readableResourceName={I18n.t('admin.norms_sidebar_copy')}
      close={close}
      scrollToFirstError
      request={{ createResource: copy }}
      modalProps={{ width: 550 }}
      formProps={{
        initialValues: {
          name: `${norm.name} - ${'copy'}`,
          ownerId: norm?.owner?.id,
        },
      }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('activerecord.attributes.norm.name')}
            rules={[{ required: true, transform: value => value.trim() }]}
          >
            <Input name="norm_name" />
          </Form.Item>
          <Form.Item
            name="ownerId"
            label={I18n.t('shared.owner')}
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
              <Select.Option>{I18n.t('admin.tte')}</Select.Option>
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

export default CopyNormsFormModal
