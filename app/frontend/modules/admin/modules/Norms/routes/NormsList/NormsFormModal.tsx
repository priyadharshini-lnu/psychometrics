import React from 'react'
import {
  Form, Input, Select, Spin,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { useResources } from '~/hooks/useResources'
import { AdditionRelationshipAttribute } from '~/libs/jsonApi/interfaces'
import { Norm } from '~/modules/admin/modules/client/core/norms'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { Dimension } from '~/modules/admin/modules/client/core/dimensions'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
)

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  norm: AdditionRelationshipAttribute<Norm>
  close(): void
}

type Props = PropsFromRedux & OwnProps

type OptionsType = {
  id: string
  name: string
}

export const NormsFormModalComponent: React.FC<Props> = ({
  norm,
  close,
  currentUser,
}) => {
  const {
    data: clients, fetch: fetchClients, isLoading: isClientsLoading,
  } = useResources<Client>('clients')

  const {
    data: dimensions, fetch: fetchDimensions, isLoading: isDimensionsLoading,
  } = useResources<Dimension>('dimensions')

  const { resource } = useResourceContext<Norm>()

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
      readableResourceName={I18n.t('admin.norms_title')}
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 620 }}
      request={{
        createResource: resource.createResource,
        updateResource: resource.updateResource,
      }}
    >
      {(form) => {
        const ownerId = Form.useWatch('ownerId', form)
        const selectedOwnerId = ownerId ?? norm?.owner?.id

        return (
          <>
            <Form.Item
              name="name"
              label={I18n.t('shared.name')}
              rules={[{ required: true }]}
            >
              <Input name="client_name" />
            </Form.Item>

            <Form.Item
              name="ownerId"
              label={I18n.t('shared.owner')}
              initialValue={norm?.owner?.id || null}
            >
              <Select
                showSearch={{
                  filterOption: false,
                  onSearch: (value) => {
                    fetchClients({
                      apiConfig: {
                        filter: { filterable_fields: value },
                        fields: { clients: ['name'] },
                      },
                    })
                  },
                }}
                notFoundContent={
                  isClientsLoading('fetch')
                    ? <Spin size="small" />
                    : I18n.t('shared.no_results_found')
                }
              >
                {isSuperAdmin(currentUser) && (
                  <Select.Option>{I18n.t('admin.tte')}</Select.Option>
                )}
                {getClients().map(({ id, name }) => (
                  <Select.Option key={id} value={id}>
                    {name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="dimensionId"
              label={I18n.t('shared.dimension')}
              rules={[{ required: true }]}
            >
              <Select
                showSearch={{
                  filterOption: false,
                  onSearch: (value) => {
                    fetchDimensions({
                      apiConfig: {
                        filter: {
                          filterable_fields: value,
                          owner_id: selectedOwnerId,
                        },
                        fields: {
                          dimensions: ['name'],
                        },
                      },
                    })
                  },
                }}
                notFoundContent={
                  isDimensionsLoading('fetch')
                    ? <Spin size="small" />
                    : I18n.t('shared.no_results_found')
                }
              >
                {getDimensions().map(({ id, name }) => (
                  <Select.Option key={id} value={id}>
                    {name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="normType"
              label={I18n.t('admin.norms_score_types_norm_type')}
              rules={[{ required: true }]}
            >
              <Select
                disabled={!!norm}
                showSearch
                filterOption={false}
              >
                <Select.Option key="five_scale" value="five_scale">
                  {I18n.t('admin.norms_score_types_five_scale')}
                </Select.Option>
                <Select.Option key="percentile" value="percentile">
                  {I18n.t('admin.norms_score_types_percentage')}
                </Select.Option>
              </Select>
            </Form.Item>
          </>
        )
      }}
    </ResourceFormModal>
  )
}

export const NormsFormModal = connector(NormsFormModalComponent)
