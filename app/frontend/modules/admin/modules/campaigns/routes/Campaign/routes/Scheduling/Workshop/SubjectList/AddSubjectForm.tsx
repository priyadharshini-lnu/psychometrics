import React from 'react'
import {
  Form, Select, Space, Spin,
} from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { WorkshopSubject } from '~/modules/admin/modules/campaigns/core/workshopSubject'
import { useResources } from '~/hooks/useResources'
import { User, UserTR } from '~/modules/admin/modules/campaigns/core/user'

const { I18n } = window

interface Props {
  close(): void
}

export const AddSubjectForm:React.FC<Props> = ({ close }) => {
  const { resource } = useResourceContext<WorkshopSubject>()
  const { campaignId, id } = useParams<{ campaignId: string, id: string }>()
  const {
    data: users, fetch: fetchUsers, isLoading: isUsersLoading,
  } = useResources<User>('users', { basePath: `campaigns/${campaignId}`, responseType: UserTR })

  return (
    <ResourceFormModal
      resourceName="workshop_subjects"
      readableResourceName={I18n.t('administration.invited_subject.subject')}
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: resource.createResource }}
    >
      {() => (
        <>
          <Form.Item
            name="userId"
            label={I18n.t('administration.scheduling.campaign_participants')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              placeholder={(
                <Space>
                  <SearchOutlined />
                  {I18n.t('administration.scheduling.search_participant')}
                </Space>
              )}
              onSearch={(value) => {
                fetchUsers({ apiConfig: { filter: { search_query: value } } })
              }}
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
          <Form.Item hidden name="workshopId" rules={[{ required: true }]} initialValue={id} />
        </>
      )}
    </ResourceFormModal>
  )
}
