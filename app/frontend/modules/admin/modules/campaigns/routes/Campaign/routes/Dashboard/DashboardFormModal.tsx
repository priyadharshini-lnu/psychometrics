import React, { useEffect, useState } from 'react'
import { Form, Input, Select } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
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
  const navigate = useNavigate()
  const { campaignId, projectId } = useParams() as { campaignId: string, projectId: string }
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
      navigate(`/admin/projects/${projectId}/new_campaigns/${campaignId}/dashboard`)
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
      formProps={{ initialValues: { dashboard_type: 'oracle_analytics' } }}
      request={{
        createResource: handleDashboardCreation,
      }}
    >
      {({ form }) => (
        <>
          <Form.Item
            name="dashboard_type"
            label={I18n.t('shared.type')}
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="powerbi">
                {I18n.t('admin.dashboard_dashboard_types_powerbi')}
              </Select.Option>
              <Select.Option value="oracle_analytics">
                {I18n.t('admin.dashboard_dashboard_types_oracle_analytics')}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label={I18n.t('shared.name')}
            rules={[{ required: true }]}
          >
            <Input name="dashboard_name" />
          </Form.Item>

          {form.getFieldValue('dashboard_type') === 'powerbi' && (
            <Form.Item
              name="capacityId"
              label={I18n.t('admin.dashboard_capacity_name')}
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
          )}
        </>
      )}
    </ResourceFormModal>
  )
}
