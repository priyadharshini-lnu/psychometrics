import React, { useEffect, useMemo, useState } from 'react'
import {
  Modal, Form, Select, Spin, Button,
} from 'antd'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import { CreateResource } from '~/hooks/useResources/interfaces'
import { UserDetails } from '~/modules/admin/modules/client/core/users'
import { Admin } from '~/modules/admin/modules/client/core/admin'
import { extractErrorTitle } from '~/utils/requestErrors'

type Props = {
  open: boolean
  onClose: () => void
  createAdmin: CreateResource<Admin>
  loading: boolean
}

type ClientAssessorCreatePayload = {
  userId?: string[]
  email?: string
  campaignId?: string
  clientId?: string
  projectId?: string
  role: 'client_assessor'
  grantNames: {
    clients: string[]
  }
}

const { I18n } = window

export const ClientAssessorModal: React.FC<Props> = ({
  open, onClose, createAdmin, loading,
}) => {
  const [form] = Form.useForm()
  const [errors, setErrors] = useState<string[]>([])
  const { clientId, projectId, campaignId } = useParams() as {
    clientId: string
    projectId: string
    campaignId: string
  }
  const [userSearchTerm, setUserSearchTerm] = useState('')

  const {
    data: users, fetch: fetchUsers, isLoading: isUserLoading,
  } = useResources<UserDetails>('users')

  useEffect(() => {
    if (!open) return

    fetchUsers({
      apiConfig: {
        filter: {
          role_in: ['Users::Admin', 'Users::SuperAdmin'],
          global_assessor_eq: 'true',
        },
        fields: { users: ['id', 'email', 'first_name', 'last_name'] },
      },
    })
  }, [open])

  const options = useMemo(
    () => users.map(({ id, email }) => ({ label: email, value: id })),
    [users],
  )

  const handleCancel = () => {
    form.resetFields()
    setUserSearchTerm('')
    setErrors([])
    onClose()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const value = typeof values.userId === 'string' ? values.userId.trim() : ''
    const existingUserIds = _.map(users, 'id')
    const notFromList = value ? !_.includes(existingUserIds, value) : false

    await createAdmin({
      userId: notFromList ? [] : [value],
      email: notFromList ? value : undefined,
      campaignId,
      clientId: clientId || undefined,
      projectId,
      role: 'client_assessor',
      grantNames: { clients: [] },
    } as ClientAssessorCreatePayload as Parameters<CreateResource<Admin>>[0])
      .then(handleCancel)
      .catch((error) => {
        const messages = (Array.isArray(error) ? error : [error]).flatMap(errorObject => (
          Object.values(errorObject || {}).flatMap((e: unknown) => {
            const msg = extractErrorTitle(e)
            return msg ? [msg] : []
          })
        ))
        setErrors(messages)
      })
  }

  let userSelectNotFoundContent: React.ReactNode = null
  if (isUserLoading('fetch')) {
    userSelectNotFoundContent = <Spin size="small" />
  } else if (userSearchTerm.trim()) {
    userSelectNotFoundContent = I18n.t('shared.no_results_found')
  }

  return (
    <Modal
      title={I18n.t('admin.add_client_assessor')}
      open={open}
      onCancel={handleCancel}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={loading}>
          {I18n.t('shared.cancel')}
        </Button>,
        <Button key="save" type="primary" onClick={handleSubmit} loading={loading}>
          {I18n.t('shared.save')}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="userId"
          label={I18n.t('shared.email')}
          rules={[{ required: true }]}
          validateStatus={errors.length > 0 ? 'error' : undefined}
          help={errors.length ? errors.map((error, index) => <div key={index}>{error}</div>) : null}
        >
          <Select
            showSearch
            allowClear
            options={options}
            optionFilterProp="label"
            filterOption={(input, option) => {
              const optionLabel = typeof option?.label === 'string' ? option.label : ''
              return optionLabel.toLowerCase().includes(input.trim().toLowerCase())
            }}
            onSearch={(value) => {
              setUserSearchTerm(value)
              fetchUsers({
                apiConfig: {
                  filter: {
                    search_query: value,
                    role_in: ['Users::Admin', 'Users::SuperAdmin'],
                    global_assessor_eq: 'true',
                  },
                  fields: { users: ['id', 'email', 'first_name', 'last_name'] },
                },
              })
            }}
            onChange={(value) => {
              form.setFieldsValue({ userId: typeof value === 'string' ? value.trim() : value })
              setErrors([])
            }}
            notFoundContent={userSelectNotFoundContent}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
