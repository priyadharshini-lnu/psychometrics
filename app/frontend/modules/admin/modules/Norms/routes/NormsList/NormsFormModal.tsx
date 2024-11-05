import React from 'react'
import {
  Form, Input, Select, Spin,
} from 'antd'
import { CreateResource, UpdateResource } from '~/hooks/useResources/interfaces'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResources } from '~/hooks/useResources'
import { AdditionRelationshipAttribute } from '~/libs/jsonApi/interfaces'
import { Norm } from '~/modules/admin/modules/client/core/norms'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { Dimension } from '~/modules/admin/modules/client/core/dimensions'

const { I18n } = window

interface Props {
  norm: AdditionRelationshipAttribute<Norm>
  addNorm: CreateResource<Norm>
  updateNorm: UpdateResource<Norm>
  close(): void
}

type OptionsType = {
  id: string
  name: string
}

export const NormsFormModal: React.FC<Props> = ({
  norm,
  addNorm,
  updateNorm,
  close,
}) => {
  const {
    data: clients, fetch: fetchClients, isLoading: isClientsLoading,
  } = useResources<Client>('clients')

  const {
    data: dimensions, fetch: fetchDimensions, isLoading: isDimensionsLoading,
  } = useResources<Dimension>('dimensions')

  const getClients = (): OptionsType[] => {
    if (!norm || !norm.owner || clients.find(d => norm?.owner?.id === d.id)) {
      return clients
    }
    return [...clients, norm.owner]
  }

  const getDimensions = (): OptionsType[] => {
    if (!norm || !norm.dimension || dimensions.find(d => norm?.dimension?.id === d.id)) {
      return dimensions
    }

    return [...dimensions, norm.dimension]
  }

  return (
    <ResourceFormModal
      resourceName="norms"
      resource={norm}
      readableResourceName="Norm"
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 620 }}
      request={{
        createResource: addNorm,
        updateResource: updateNorm,
      }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('common.column.name')}
            rules={[{ required: true }]}
          >
            <Input name="client_name" />
          </Form.Item>

          <Form.Item
            name="ownerId"
            label={I18n.t('common.column.owner')}
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

          <Form.Item
            name="dimensionId"
            label={I18n.t('common.column.dimension')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              onSearch={(value) => {
                fetchDimensions({
                  apiConfig: { filter: { filterable_fields: value }, fields: { dimensions: ['name'] } },
                })
              }}
              notFoundContent={isDimensionsLoading('fetch') ? <Spin size="small" /> : null}
              filterOption={false}
            >
              {getDimensions().map(({ id, name }) => (
                <Select.Option key={id} value={id}>{name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="normType"
            label={I18n.t('administration.norms.score_types.norm_type')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              filterOption={false}
            >
              <Select.Option key="five_scale" value="five_scale">
                {I18n.t('administration.norms.score_types.five_scale')}
              </Select.Option>
              <Select.Option key="percentile" value="percentile">
                {I18n.t('administration.norms.score_types.percentage')}
              </Select.Option>
            </Select>
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
