import React, { useState } from 'react'
import {
  Form, FormInstance, Input, Radio, Space,
} from 'antd'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import UserAutocomplete from '~/components/UserAutocomplete'
import ResourceFormModal from '~/components/ResourceFormModal'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getAutocomplete } from '~/modules/admin/core/ui/autocomplete'

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

const UserFormModal: React.FC<Props> = ({ campaignId, close, user }) => {
  const [email, setEmail] = useState('')
  const { projectId } = useParams()
  const autocompletedUsers = useSelector((state: RootState) => getAutocomplete(state)?.users || [])


  const onSelectUser = (userValue: string, formInstance: FormInstance) => {
    const user = JSON.parse(userValue)

    formInstance.setFieldsValue({
      email: user.email,
      firstName: user.firstName || user.first_name,
      lastName: user.lastName || user.last_name,
      locale: user.locale,
    })
  }

  return (
    <ResourceFormModal
      resourceName="user"
      readableResourceName={I18n.t('admin.users_user')}
      requestScope="campaigns"
      resourceBaseUrl={`/administration/new_campaigns/${campaignId}/users`}
      resource={user}
      showSuccessMessages
      close={close}
      modalProps={{ width: 550 }}
      formProps={{ initialValues: { operation: OPERATIONS_OPTIONS[0] } }}
    >
      {({ isEdit, form }) => (
        <>
          <Form.Item
            name="email"
            label={I18n.t('user.form.email')}
            rules={[
              {
                required: true,
                message: I18n.t('validations.blank'),
              },
              {
                type: 'email',
                message: I18n.t('validations.email'),
              },
            ]}
          >
            <UserAutocomplete
              onSelect={(userValue: string) => onSelectUser(userValue, form)}
              source="users"
              onChange={setEmail}
              value={email}
              users={autocompletedUsers}
              url={`/administration/projects/${projectId}/search_users`}
              placeholder={I18n.t('user.form.email')}
              searchOnChange
            />
          </Form.Item>
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
                <Space orientation="vertical">
                  {OPERATIONS_OPTIONS.map(operation => (
                    <Radio key={operation} value={operation}>
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
}

export default UserFormModal
