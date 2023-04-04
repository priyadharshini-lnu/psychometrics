import React from 'react'
import { Form, Input } from 'antd'
import ResourceFormModal from '~/components/ResourceFormModal'
import { UserTR } from '~/modules/admin/modules/client/core/users'
import { useResourceContext } from '~/modules/admin/components/Resource'

const { I18n } = window

interface Props {
  close(): void
}

export const UserFormModal: React.FC<Props> = ({ close }) => {
  const { resource } = useResourceContext()

  const createResource = (body: Record<string, string | undefined | null>) => resource.collectionAction({
    action: 'create_superadmin',
    method: 'post',
    body,
    updateStore: true,
    responseType: UserTR,
  })

  return (
    <ResourceFormModal
      resourceName="users"
      readableResourceName="User"
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 620 }}
      request={{ createResource }}
    >
      {() => (
        <>
          <Form.Item
            name="email"
            label={I18n.t('common.column.email')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="first_name"
            label={I18n.t('common.column.first_name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="last_name"
            label={I18n.t('common.column.last_name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
