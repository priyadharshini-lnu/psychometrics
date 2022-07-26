import React from 'react'
import { Form, Input } from 'antd'
import ResourceFormModal from 'components/ResourceFormModal'
import { useHistory, useParams } from 'react-router-dom'
import { formDataToResource } from 'libs/jsonApi/helpers'
import { useResources } from 'hooks/useResources'
import { Dashboard as DashboardType, dashboardAtom, DashboardTR } from 'modules/admin/modules/campaigns/core/dashboard'
import { useRecoilStateStateManager } from 'hooks/useRecoilStateStateManager'

const { I18n } = window

interface Props {
  close(): void
}

export const DashboardFormModal: React.FC<Props> = ({
  close,
}) => {
  const history = useHistory()
  const { campaignId, projectId } = useParams<{ campaignId: string, projectId: string }>()
  const stateManager = useRecoilStateStateManager(dashboardAtom)
  const { createResource } = useResources<DashboardType>('dashboards', { responseType: DashboardTR, stateManager })

  const handleDashboardCreation = (values) => {
    const resource = formDataToResource({ ...values, campaignId }, 'dashboards')
    return createResource(resource).then(() => {
      history.push(`/administration/projects/${projectId}/new_campaigns/${campaignId}/dashboard`)
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
        </>
      )}
    </ResourceFormModal>
  )
}
