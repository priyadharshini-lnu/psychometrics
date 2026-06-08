import React from 'react'
import {
  Form, Select, Space, Spin,
} from 'antd'
import { useParams } from 'react-router-dom'
import { SearchOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
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
  const { campaignId, id } = useParams() as { campaignId: string, id: string }
  const {
    data: users, fetch: fetchUsers, isLoading: isUsersLoading,
  } = useResources<User>('users', { basePath: `campaigns/${campaignId}`, responseType: UserTR })
  const [form] = Form.useForm()

  const transformValues = values => ({
    userId: values.userId,
    workshopId: values.workshopId,
  })

  return (
    <ResourceFormModal
      resourceName="workshop_subjects"
      readableResourceName={I18n.t('admin.subject')}
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: resource.createResource }}
      transformValues={transformValues}
      storeManager={{ form }}
    >
      {() => (
        <>
          <Form.Item
            name="userId"
            label={I18n.t('admin.scheduling_campaign_participants')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch={{
                filterOption: false,
                onSearch: (value) => {
                  fetchUsers({ apiConfig: { filter: { search_query: value } } })
                },
              }}
              placeholder={(
                <Space>
                  <SearchOutlined />
                  {I18n.t('admin.scheduling_search_participant')}
                </Space>
              )}
              notFoundContent={isUsersLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
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
