import React from 'react'
import {
  Checkbox,
  Flex,
  Form, Input, Select, Spin,
} from 'antd'
import { Dimension } from '~/modules/admin/modules/client/core/dimensions'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResources } from '~/hooks/useResources'
import { Client } from '~/modules/admin/modules/client/core/clients'

type Props = {
  close(): void
  dimension?: Dimension
}

type OptionsType = {
  id: string
  name: string
}

const { I18n } = window

export const DimensionsFormModal: React.FC<Props> = ({ close, dimension }) => {
  const { resource } = useResourceContext<Dimension>()
  const [form] = Form.useForm()

  const {
    data: clients, fetch: fetchClients, isLoading: isClientsLoading,
  } = useResources<Client>('clients')

  const getClients = (): OptionsType[] => {
    if (!dimension || !dimension.owner || clients.find(d => dimension?.owner?.id === d.id)) {
      return clients
    }
    return [...clients, dimension.owner]
  }

  return (
    <ResourceFormModal
      resourceName="dimensions"
      resource={dimension}
      readableResourceName={I18n.t('administration.dimensions.form.title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: resource.createResource, updateResource: resource.updateResource }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('administration.dimensions.form.name')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="ownerId"
            label={I18n.t('common.column.owner')}
            initialValue={dimension?.owner?.id || null}
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
              <Select.Option>{I18n.t('administration.tte')}</Select.Option>
              {getClients().map(({ id, name }) => (
                <Select.Option key={id} value={id}>{name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Flex gap="small" align="center">
            <Form.Item name="occupationsEnabled" valuePropName="checked" style={{ flex: 1 }}>
              <Checkbox>{I18n.t('administration.dimensions.form.enable_occupations')}</Checkbox>
            </Form.Item>
            <Form.Item name="innovationStylesEnabled" valuePropName="checked" style={{ flex: 1 }}>
              <Checkbox>{I18n.t('administration.dimensions.form.enable_innovation_styles')}</Checkbox>
            </Form.Item>
          </Flex>
        </>
      )}
    </ResourceFormModal>
  )
}
