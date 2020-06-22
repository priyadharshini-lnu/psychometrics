import React from 'react'
import ResourceFormModal from 'components/ResourceFormModal'
import { Form, Input, Select } from 'antd'
import { STATUSES, TYPES } from 'admin/constants/campaign'
import _ from 'lodash'

const { Option } = Select

interface Props {
  projectId: number
  close(): void
  campaign: {
    id: number
  }
}

const CommonCampaignFormModal: React.FC<Props> = ({
  projectId,
  close,
  campaign,
}) => (
  <ResourceFormModal
    resourceName="campaign"
    resourceBaseUrl={`/administration/projects/${projectId}/new_campaigns`}
    resource={campaign}
    showSuccessMessages
    close={close}
    modalProps={{ width: 550 }}
    formProps={{ initialValues: { status: STATUSES.ACTIVE, type: TYPES.COMMON } }}
  >
    {() => (
      <>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="status"
          label="Status"
          required
        >
          <Select>
            {_.map(STATUSES, (status: string) => (
              <Option key={status} value={status}>{_.capitalize(status)}</Option>))}
          </Select>
        </Form.Item>
        <Form.Item name="type" noStyle>
          <Input type="hidden" />
        </Form.Item>
      </>
    )}
  </ResourceFormModal>
)

export default CommonCampaignFormModal
