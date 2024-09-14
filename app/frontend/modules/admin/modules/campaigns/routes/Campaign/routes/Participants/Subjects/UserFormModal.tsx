import React from 'react'
import {
  Form, Input, Radio, Space,
} from 'antd'

import ResourceFormModal from '~/components/ResourceFormModal'

const { I18n } = window

interface Props {
  campaignId: string
  close(): void
  user?: {
    id: number
  }
}

const OPERATIONS_OPTIONS = [
  'skip_existing',
  'add_with_existing_response',
  'add_and_allow_new_response',
]

const UserFormModal: React.FC<Props> = ({ campaignId, close, user }) => (
  <ResourceFormModal
    resourceName="user"
    readableResourceName="User"
    requestScope="campaigns"
    resourceBaseUrl={`/administration/new_campaigns/${campaignId}/users`}
    resource={user}
    showSuccessMessages
    close={close}
    modalProps={{ width: 550 }}
    formProps={{ initialValues: { operation: OPERATIONS_OPTIONS[0] } }}
  >
    {({ isEdit }) => (
      <>
        <Form.Item
          name="firstName"
          label={I18n.t('user.form.first_name')}
          rules={[{ required: true }]}
        >
          <Input name="participant_firstname" />
        </Form.Item>
        <Form.Item
          name="lastName"
          label={I18n.t('user.form.last_name')}
          rules={[{ required: true }]}
        >
          <Input name="participant_lastname" />
        </Form.Item>
        <Form.Item
          name="email"
          label={I18n.t('user.form.email')}
          rules={[{ required: true }]}
        >
          <Input name="participant_email" />
        </Form.Item>
        <Form.Item
          name="locale"
          label={I18n.t('user.form.locale')}
        >
          <Input name="participant_locale" />
        </Form.Item>
        {!isEdit && (
          <Form.Item
            name="operation"
            label={I18n.t('user.form.operation')}
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                {OPERATIONS_OPTIONS.map(operation => (
                  <Radio value={operation}>
                    {I18n.t(`user.form.operation_options.${operation}`)}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>
        )}
      </>
    )}
  </ResourceFormModal>
)

export default UserFormModal
