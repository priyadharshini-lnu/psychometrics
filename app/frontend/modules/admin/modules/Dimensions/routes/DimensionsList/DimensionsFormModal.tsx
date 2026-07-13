import React, { useEffect } from 'react'
import {
  Checkbox,
  Flex,
  Form, Input, Select, Spin,
} from 'antd'
import { isSuperAdmin } from '~/core/currentUser'
import { useCurrentUser } from '~/hooks/useCurrentUser'
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
  const { currentUser } = useCurrentUser()
  const { resource } = useResourceContext<Dimension>()
  const [form] = Form.useForm()
  const occupationsEnabled = Form.useWatch('occupationsEnabled', form)

  const {
    data: clients, fetch: fetchClients, isLoading: isClientsLoading,
  } = useResources<Client>('clients')

  const {
    data: conditionSets,
    fetch: fetchOccupationConditionSets, isLoading: isOccupationConditionSetsLoading,
  } = useResources<{ id: string, name: string }>('occupation_condition_sets', {
    basePath: `dimensions/${dimension?.id}/`,
  })

  useEffect(() => {
    if (occupationsEnabled) {
      fetchOccupationConditionSets()
    }
  }, [occupationsEnabled])

  const hasConditionSets = conditionSets && conditionSets.length > 0


  const getClients = (): OptionsType[] => {
    if (!dimension || !dimension.owner || clients.find(d => dimension?.owner?.id === d.id)) {
      return clients
    }
    return [...clients, dimension.owner]
  }

  const getOptionsForClients = () => {
    const clientsOptions: { label: string, value: string | null }[] = getClients().map(({ id, name }) => ({
      label: name,
      value: id,
    }))

    if (isSuperAdmin(currentUser)) {
      clientsOptions.unshift({ label: I18n.t('admin.tte'), value: null })
    }

    return clientsOptions
  }

  return (
    <ResourceFormModal
      resourceName="dimensions"
      resource={dimension}
      readableResourceName={I18n.t('admin.dimensions_form_title')}
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
            label={I18n.t('shared.name')}
            rules={[{ required: true, message: I18n.t('admin.name_required') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="ownerId"
            label={I18n.t('shared.owner')}
            initialValue={dimension?.owner?.id || null}
            rules={[
              {
                validator: (_, value) => {
                  if (value !== undefined) return Promise.resolve()

                  return Promise.reject(new Error(I18n.t('admin.this_field_is_required')))
                },
              },
            ]}
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
              options={getOptionsForClients()}
            />
          </Form.Item>
          <Flex gap="small" align="center">
            <Form.Item name="occupationsEnabled" valuePropName="checked" style={{ flex: 1 }}>
              <Checkbox>{I18n.t('admin.dimensions_form_enable_occupations')}</Checkbox>
            </Form.Item>
            <Form.Item name="innovationStylesEnabled" valuePropName="checked" style={{ flex: 1 }}>
              <Checkbox>{I18n.t('admin.dimensions_form_enable_innovation_styles')}</Checkbox>
            </Form.Item>
          </Flex>
          {dimension?.id && hasConditionSets && occupationsEnabled && (
            <Form.Item
              name="defaultOccupationConditionSetId"
              label={I18n.t('admin.default_occupation_condition_set')}
            >
              <Select
                showSearch={{ optionFilterProp: 'label' }}
                options={conditionSets.map(({ id, name }) => ({ value: Number(id), label: name }))}
                notFoundContent={
                  isOccupationConditionSetsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
              />
            </Form.Item>
          )}
        </>
      )}
    </ResourceFormModal>
  )
}
