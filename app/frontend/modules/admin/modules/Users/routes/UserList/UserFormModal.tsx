import React from 'react'
import {
  Form, Input,
} from 'antd'
import { CreateResource } from '~/hooks/useResources/interfaces'
import ResourceFormModal from '~/components/ResourceFormModal'
import { AdditionRelationshipAttribute } from '~/libs/jsonApi/interfaces'
import { User } from '~/modules/admin/modules/client/core/users'

const { I18n } = window

interface Props {
  user: AdditionRelationshipAttribute<User>
  addUser: CreateResource<User>
  close(): void
}

export const UserFormModal: React.FC<Props> = ({
  user,
  addUser,
  close,
}) => (
  <ResourceFormModal
    resourceName="users"
    resource={user}
    readableResourceName="User"
    showSuccessMessages
    close={close}
    scrollToFirstError
    modalProps={{ width: 620 }}
    request={{
      createResource: addUser,
    }}
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
