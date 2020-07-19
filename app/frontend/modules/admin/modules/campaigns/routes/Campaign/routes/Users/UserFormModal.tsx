import React from 'react'
import ResourceFormModal from 'components/ResourceFormModal'
import { Form, Input, Select } from 'antd'
import _ from 'lodash'

const { Option } = Select
interface Props {
  projectId: string
  campaignId: string
  close(): void
  user?: {
    id: number
  }
}

const operationsOption = {
  skip_existing: 'Skip exiting user',
  add_with_existing_response: 'Add user with exiting response',
  add_and_allow_new_response: 'Add user and allow new response',
}

const UserFormModal: React.FC<Props> = ({
  projectId,
  campaignId,
  close,
  user,
}) => (
  <ResourceFormModal
    resourceName="user"
    requestScope="campaigns"
    resourceBaseUrl={`/administration/projects/${projectId}/new_campaigns/${campaignId}/users`}
    resource={user}
    showSuccessMessages
    close={close}
    modalProps={{ width: 550 }}
    formProps={{ initialValues: { operation: 'skip_existing' } }}
  >
    {({ isEdit }) => (
      <>
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        {!isEdit
          && (
          <Form.Item
            name="operation"
            label="Operation"
            rules={[{ required: true }]}
          >
            <Select>
              {_.map(operationsOption, (value: string, key: string) => (
                <Option key={key} value={key}>{value}</Option>
              ))}
            </Select>
          </Form.Item>
          )}
      </>
    )}
  </ResourceFormModal>
)

export default UserFormModal
