import React, { useEffect } from 'react'
import { Form, Input } from 'antd'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { WorkshopResource } from '~/modules/admin/modules/campaigns/core/workshopResource'

interface Props {
  workshopId: string,
  workshopResource?: WorkshopResource
  close(): void
}

const { I18n } = window

export const WorkshopResourceForm: React.FC<Props> = ({
  workshopId, workshopResource, close,
}) => {
  const { resource } = useResourceContext<WorkshopResource>()
  const [form] = Form.useForm()

  useEffect(() => {
    form.setFieldValue('workshopId', workshopId)
  }, [])

  return (
    <ResourceFormModal
      resourceName="workshop_resources"
      resource={workshopResource}
      readableResourceName={I18n.t('admin.scheduling_resources_resource')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: resource.createResource, updateResource: resource.updateResource }}
    >
      {() => (
        <>
          <Form.Item hidden name="workshopId" rules={[{ required: true }]}><Input.TextArea /></Form.Item>
          <Form.Item
            name="name"
            label={I18n.t('shared.name')}
            rules={[{ required: true }]}
          >
            <Input.TextArea name="workshop_resource_name" />
          </Form.Item>
          <Form.Item
            name="url"
            label={I18n.t('admin.scheduling_columns_resource_link')}
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
