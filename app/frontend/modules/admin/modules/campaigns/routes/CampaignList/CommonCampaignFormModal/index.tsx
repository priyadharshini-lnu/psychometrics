import React, { useEffect, useState } from 'react'
import ResourceFormModal from 'components/ResourceFormModal'
import { STATUSES, TYPES } from 'constants/campaign'
import {
  Form, Input, Select, DatePicker, Typography, Space,
} from 'antd'
import _ from 'lodash'
import moment from 'moment'

const { I18n } = window
const { Option } = Select
const { Text } = Typography

interface Props {
  projectId: number
  close(): void
  campaign?: {
    id: number,
    status: string,
    startDate?: Date,
    endDate?: Date,
    isFixedTime: boolean,
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

const notices = {
  active: 'Note: Campaign status will automatically change to active on the selected start date & time',
  inactive: 'Note: Campaign status will automatically change to closed on the selected end date & time',
}

const CommonCampaignFormModal: React.FC<Props> = ({
  projectId,
  close,
  campaign,
}) => {
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    if (campaign && campaign.isFixedTime) setNotice(notices[campaign.status])
  }, [])

  const transformValues = values => ({
    ...values,
    startDate: values.startDate && values.startDate.format(),
    endDate: values.endDate && values.endDate.format(),
  })

  const handleStatusChange = (value) => {
    setNotice(notices[value])
  }

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
            label={I18n.t('administration.campaigns.form.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label={I18n.t('administration.campaigns.form.status')}
            required
          >
            <Select onChange={handleStatusChange}>
              {_.map(STATUSES, (status: string) => (
                <Option key={status} value={status}>{_.capitalize(status)}</Option>))}
            </Select>
          </Form.Item>
          <Form.Item
            name="startDate"
            label={I18n.t('administration.dates.start')}
          >
            <DatePicker showTime format={format} disabledDate={disabledDate} disabledTime={disabledDateTime} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label={I18n.t('administration.dates.end')}
          >
            <DatePicker showTime format={format} disabledDate={disabledDate} />
          </Form.Item>
          <Space>
            <Text mark strong>{notice}</Text>
          </Space>
          <Form.Item name="type" noStyle>
            <Input type="hidden" />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}

export default CommonCampaignFormModal
