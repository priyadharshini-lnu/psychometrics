import React from 'react'
import ResourceFormModal from 'components/ResourceFormModal'
import { STATUSES, TYPES } from 'constants/campaign'
import {
  Form, Input, Select, DatePicker,
} from 'antd'
import _ from 'lodash'

const { Option } = Select

interface Props {
  projectId: number
  close(): void
  campaign?: {
    id: number,
    startDate?: Date,
    endDate?: Date,
  }
}

// function range (start: number, end: number) {
//   return Array.from({ length: end - start }, (_, i) => i)
// }

// function disabledDate (current) {
//   // Can not select days before today and today
//   return current && current < moment().endOf('day');
// }

// function disabledDateTime () {
//   return {
//     disabledHours: () => range(0, 24).splice(4, 20),
//     disabledMinutes: () => range(30, 60),
//     disabledSeconds: () => [55, 56],
//   }
// }

const CommonCampaignFormModal: React.FC<Props> = ({
  projectId,
  close,
  campaign,
}) => {
  // eslint-disable-next-line no-console
  console.log('campaign: ', campaign)
  // const transformValues = values => ({
  //   ...values,
  //   id: campaign && campaign.id,
  //   startDate: values.startDate.format('YYYY-MM-DD HH:mm'),
  //   endDate: values.endDate.format('YYYY-MM-DD HH:mm'),
  // })

  return (
    <ResourceFormModal
      resourceName="campaign"
      resourceBaseUrl={`/administration/projects/${projectId}/new_campaigns`}
      resource={campaign}
      showSuccessMessages
      close={close}
      modalProps={{ width: 550 }}
      formProps={{ initialValues: { status: STATUSES.ACTIVE, type: TYPES.COMMON } }}
      // transformValues={transformValues}
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
          <Form.Item
            name="startDate"
            label="Start Date"
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="End Date"
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item name="type" noStyle>
            <Input type="hidden" />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}

export default CommonCampaignFormModal
