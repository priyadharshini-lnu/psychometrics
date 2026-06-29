import React from 'react'
import {
  Modal, Form, Input, Select, Spin, App,
} from 'antd'
import { connect } from 'react-redux'
import { useResources } from '~/hooks/useResources'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { Client } from '~/modules/admin/modules/client/core/clients'

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
)

const { I18n } = window

interface CreateBlockModalProps {
    visible: boolean
    onCancel: () => void
    onCreate: (values: { name: string, ownerId?: string }) => Promise<void>
    currentUser: unknown
}

const CreateBlockModal: React.FC<CreateBlockModalProps> = ({
  visible,
  onCancel,
  onCreate,
  currentUser,
}) => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const {
    data: clients, fetch: fetchClients, isLoading: isClientsLoading,
  } = useResources<Client>('clients')

  const getOptionsForClients = () => {
    const clientsOptions: { label: string, value: string | null }[] = clients.map(({ id, name }) => ({
      label: name,
      value: id,
    }))

    if (isSuperAdmin(currentUser)) {
      clientsOptions.unshift({ label: I18n.t('admin.tte'), value: null })
    }
    return clientsOptions
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const { ownerId, ...rest } = values
      await onCreate({
        ...rest,
        ...(ownerId ? { ownerId } : {}),
      })
      form.resetFields()
      message.success(I18n.t('shared.created_successfully'))
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  return (
    <Modal
      title={I18n.t('admin.blocks_new_button') || 'New Block'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText={I18n.t('shared.create') || 'Create'}
      cancelText={I18n.t('shared.close') || 'Close'}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label={I18n.t('shared.name') || 'Name'}
          rules={[{ required: true, message: 'Please enter a block name' }]}
        >
          <Input placeholder="Block Name" />
        </Form.Item>

        <Form.Item
          name="ownerId"
          label={I18n.t('shared.owner')}
        >
          <Select
            showSearch
            onSearch={(value) => {
              fetchClients({
                apiConfig: { filter: { filterable_fields: value }, fields: { clients: ['name'] } },
              })
            }}
            notFoundContent={isClientsLoading('fetch') ? <Spin size="small" /> : null}
            filterOption={false}
            options={getOptionsForClients()}
            placeholder={I18n.t('shared.owner')}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default connecter(CreateBlockModal)
