import React from 'react'
import { Form, Input } from 'antd'
import { CreateResource } from 'hooks/useResources/interfaces'
import ResourceFormModal from 'components/ResourceFormModal'
import { useHistory, useParams } from 'react-router-dom'
import { formDataToResource } from 'libs/jsonApi/helpers'
import { Dashboard } from '../../../../core/dashboard'

const { I18n } = window

interface Props {
  createDashboard: CreateResource<Dashboard>
  close(): void
}

export const DashboardFormModal: React.FC<Props> = ({
  createDashboard,
  close,
}) => {
  const history = useHistory()
  const { campaignId, projectId } = useParams<{ campaignId: string, projectId: string }>()

  const handleDashboardCreation = (values) => {
    const resource = formDataToResource({ ...values, campaignId }, 'dashboards')
    return createDashboard(resource).then(() => {
      history.push(`/administration/projects/${projectId}/new_campaigns/${campaignId}/dashboard/settings`)
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
