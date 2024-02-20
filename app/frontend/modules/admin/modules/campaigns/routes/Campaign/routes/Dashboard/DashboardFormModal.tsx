import React, { useEffect, useState } from 'react'
import { Form, Input, Select } from 'antd'
import { useHistory, useParams } from 'react-router-dom'
import * as t from 'io-ts'
import ResourceFormModal from '~/components/ResourceFormModal'
import { formDataToResource } from '~/libs/jsonApi/helpers'
import { useResources } from '~/hooks/useResources'
import {
  Dashboard as DashboardType, DashboardTR, useDashboardStore,
} from '~/modules/admin/modules/campaigns/core/dashboard'

const { I18n } = window

const CapacityTR = t.type({ id: t.string, name: t.string })
type Capacity = t.TypeOf<typeof CapacityTR>

interface Props {
  close(): void
}

export const DashboardFormModal: React.FC<Props> = ({
  close,
}) => {
  const history = useHistory()
  const { campaignId, projectId } = useParams<{ campaignId: string, projectId: string }>()
  const stateManager = useDashboardStore()
  const {
    createResource, collectionAction, isRequestSuccessful,
  } = useResources<DashboardType>('dashboards', { responseType: DashboardTR, stateManager })
  const [capacities, setCapacities] = useState<Capacity[]>([])

  useEffect(() => {
    collectionAction({ action: 'powerbi_capacities', method: 'get', responseType: t.array(CapacityTR) })
      .then(setCapacities)
  }, [])

  const capacitiesRequestSuccessful = isRequestSuccessful('get/powerbi_capacities')

  const handleDashboardCreation = (values) => {
    const resource = formDataToResource({ ...values, campaignId }, 'dashboards')
    return createResource(resource).then(() => {
      history.push(`/admin/projects/${projectId}/new_campaigns/${campaignId}/dashboard`)
    })
  }

  return (
    <ResourceFormModal
      resourceName="dashboards"
      readableResourceName="Dashboard"
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 620 }}
      request={{
        createResource: handleDashboardCreation,
      }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('common.column.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="capacityId"
            label={I18n.t('administration.dashboard.capacity_name')}
            rules={[{ required: true }]}
          >
            <Select loading={!capacitiesRequestSuccessful}>
              {capacities.map(c => (
                <Select.Option value={c.id}>
                  {`${c.name} - ${c.id}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
