import React from 'react'
import ResourceFormModal from 'components/ResourceFormModal'
import { Form, Input, Select } from 'antd'
import _ from 'lodash'

const { I18n } = window
const { Option } = Select

interface Props {
  projectId: string
  campaignId: string
  close(): void
  user?: {
    id: number
  }
}

const operationsOption = ['skip_existing', 'add_with_existing_response', 'add_and_allow_new_response']

const UserFormModal: React.FC<Props> = ({
  campaignId,
  close,
  user,
}) => (
  <ResourceFormModal
    resourceName="user"
    requestScope="campaigns"
    resourceBaseUrl={`/administration/new_campaigns/${campaignId}/users`}
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

        <Form.Item
          name="locale"
          label="Locale"
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
              {_.map(operationsOption, operation => (
                <Option
                  key={operation}
                  value={operation}
                >
                  {I18n.t(`user.form.operation_options.${operation}`)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          )}
      </>
    )}
  </ResourceFormModal>
)

export default UserFormModal
