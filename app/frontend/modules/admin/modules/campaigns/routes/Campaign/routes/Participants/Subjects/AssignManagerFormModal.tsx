import React, { useEffect, useState } from 'react'
import {
  Modal, Form, Button, Select, Row, Col, Space, Spin,
} from 'antd'
import { ConnectedProps, connect } from 'react-redux'
import { SearchOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { addManager } from '~/modules/admin/modules/campaigns/core/users'
import { User, UserTR } from '~/modules/admin/modules/campaigns/core/user'
import { useResources } from '~/hooks/useResources'

interface Props extends ConnectedProps<typeof connector> {
  close(): void
  projectId: number
  campaignId: number
  userId: number
  manager: {
    id: number,
    name: string
    email: string
  }
}

const connector = connect(
  null,
  { addManager },
)

const { I18n } = window

export const AssignManagerFormModalComponent: React.FC<Props> = ({
  close, projectId, campaignId, userId, manager, addManager,
}) => {
  const [form] = Form.useForm()
  const {
    data: users, fetch: fetchUsers, isLoading: isUsersLoading,
  } = useResources<User>('seach_user',
    { basePath: `/projects/${projectId}/`, responseType: UserTR })

  const [selectedManagerId, setSelectedManagerId] = useState<number | undefined>(manager.id)

  const assignManager = (userId: number) => {
    addManager(projectId, userId, selectedManagerId || null)
      .then(() => {
        close()
        form.resetFields()
      })
  }

  useEffect(() => {
    fetchUsers({
      apiConfig: {
        filter: {
          search_query: '',
          exclude_user_id: userId.toString(),
          campaign_id: campaignId.toString(),
        },
      },
    })
  }, [userId, campaignId])

  const handleInputChange = (value: string) => {
    fetchUsers({
      apiConfig: {
        filter: {
          search_query: value,
          exclude_user_id: userId.toString(),
          campaign_id: campaignId.toString(),
        },
      },
    })
  }

  return (
    <Modal
      open
      title={I18n.t('campaign_users.actions.add_manager')}
      onCancel={() => close()}
      footer={
        [
          <Button onClick={() => close()} key="cancel">
            {I18n.t('common.actions.cancel')}
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={() => assignManager(userId)}
          >
            {I18n.t('common.actions.save')}
          </Button>,
        ]
      }
    >
      <Row gutter={[16, 16]}>
        <Col span="24">
          <Form
            form={form}
            initialValues={
              manager.id
                ? { managerId: `${manager.name}  (${manager.email})` } : {}
            }
          >
            <Form.Item
              name="managerId"
              label={I18n.t('campaign_users.details.manager')}
            >
              <Select
                showSearch
                allowClear
                placeholder={(
                  <Space>
                    <SearchOutlined />
                    {I18n.t('campaign_users.actions.search_user')}
                  </Space>
                )}
                value={selectedManagerId}
                onChange={(value: number) => setSelectedManagerId(value)}
                onSearch={handleInputChange}
                notFoundContent={isUsersLoading('fetch') ? <Spin size="small" /> : null}
                filterOption={false}
              >
                {users.map(({ id, name, email }) => (
                  <Select.Option key={id} value={id}>
                    {name}
                    {' '}
                    (
                    {email}
                    )
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Modal>
  )
}

export const AssignManagerFormModal = connector(AssignManagerFormModalComponent)
