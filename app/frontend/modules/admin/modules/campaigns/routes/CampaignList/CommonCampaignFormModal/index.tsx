import React from 'react'
import ResourceFormModal from 'components/ResourceFormModal'
import { STATUSES, TYPES } from 'constants/campaign'
import {
  Form, Input, Select, DatePicker,
} from 'antd'
import _ from 'lodash'
import moment from 'moment'

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

const format = 'YYYY-MM-DD HH:mm'
const range = (start: number, end: number) => Array.from({ length: end - start }, (_, i) => i)

// Can not select days before today and today
const disabledDate = current => current && current < moment().endOf('day')
const disabledDateTime = () => ({
  disabledHours: () => range(0, 24).splice(0, moment().hour()),
  disabledMinutes: () => range(0, moment().minute()),
})

const CommonCampaignFormModal: React.FC<Props> = ({
  projectId,
  close,
  campaign,
}) => {
  const transformValues = values => ({
    ...values,
    startDate: values.startDate && values.startDate.format(),
    endDate: values.endDate && values.endDate.format(),
  })

  return (
    <ResourceFormModal
      resourceName="campaign"
      resourceBaseUrl={`/administration/projects/${projectId}/new_campaigns`}
      resource={campaign}
      showSuccessMessages
      close={close}
      modalProps={{ width: 550 }}
      formProps={{ initialValues: { status: STATUSES.ACTIVE, type: TYPES.COMMON } }}
      transformValues={transformValues}
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
            <DatePicker showTime format={format} disabledDate={disabledDate} disabledTime={disabledDateTime} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="End Date"
          >
            <DatePicker showTime format={format} disabledDate={disabledDate} />
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
