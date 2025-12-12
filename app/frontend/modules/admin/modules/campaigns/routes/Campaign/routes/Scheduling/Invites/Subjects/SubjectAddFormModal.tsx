import React, { useEffect } from 'react'
import {
  Form, Input, Select, Space, Spin,
} from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { WorkshopInvitedSubject } from '~/modules/admin/modules/UserAvailability/core/workshopInvitedSubjects'
import { useResources } from '~/hooks/useResources'
import { User, UserTR } from '~/modules/admin/modules/campaigns/core/user'

const { I18n } = window

interface Props {
  close(): void
}

export const SubjectAddFormModal:React.FC<Props> = ({ close }) => {
  const { resource } = useResourceContext<WorkshopInvitedSubject>()
  const { campaignId, inviteId } = useParams() as { campaignId: string, inviteId: string }

  const {
    data: users, fetch: fetchUsers, isLoading: isUsersLoading,
  } = useResources<User>('users', { basePath: `campaigns/${campaignId}`, responseType: UserTR })

  useEffect(() => {
    if (users.length === 0) {
      fetchUsers({
        apiConfig: {
          page: {
            number: 1,
            size: 25,
          },
        },
      })
    }
  }, [])

  return (
    <ResourceFormModal
      resourceName="workshop_invited_subjects"
      readableResourceName={I18n.t('administration.invited_subject.subject')}
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: resource.createResource, updateResource: resource.updateResource }}
    >
      {() => (
        <>
          <Form.Item hidden name="workshopInviteId" initialValue={inviteId}><Input /></Form.Item>
          <Form.Item
            name="userId"
            label={I18n.t('administration.invited_subject.subject')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              placeholder={(
                <Space>
                  <SearchOutlined />
                  {I18n.t('administration.assessment_center.invite.subjects.search_user')}
                </Space>
              )}
              onSearch={(value) => {
                fetchUsers({
                  apiConfig: {
                    filter: {
                      search_query: value,
                    },
                  },
                })
              }}
              // onSelect={selectUser}
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
        </>
      )}
    </ResourceFormModal>
  )
}
