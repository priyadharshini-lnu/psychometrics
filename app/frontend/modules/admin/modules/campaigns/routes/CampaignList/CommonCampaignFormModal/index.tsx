import React, { useEffect, useState } from 'react'
import {
  Form, Input, Select, DatePicker, Alert, Space, Switch, Tooltip,
} from 'antd'
import _ from 'lodash'
import dayjs from '~/utils/dayjs'
import { STATUSES, TYPES } from '~/constants/campaign'
import ResourceFormModal from '~/components/ResourceFormModal'

const { I18n } = window
const { Option } = Select

interface Props {
  projectId: number
  close(): void
  campaign: {
    id: number,
    status: string,
    startDate?: Date,
    endDate?: Date,
    isFixedTime: boolean,
  }
}

const format = 'YYYY-MM-DD HH:mm'
// Can not select days before today
const disabledDate = current => current && current < dayjs().startOf('day')

const notices = {
  active: 'Campaign status will automatically change to closed on the selected end date & time',
  inactive: 'Campaign status will automatically change to active on the selected start date & time',
}

const CommonCampaignFormModal: React.FC<Props> = ({
  projectId,
  close,
  campaign,
}) => {
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (campaign && campaign.isFixedTime) setNotice(notices[campaign.status])
  }, [])

  const isEdit = !!campaign?.id

  const transformValues = values => ({
    ...values,
    startDate: values.startDate && values.startDate.format(),
    endDate: values.endDate && values.endDate.format(),
  })

  const handleValuesChange = (changedValues: object, allValues: { status, startDate, endDate }) => {
    if (allValues.status === 'active' && allValues.endDate) {
      setNotice(notices.active)
    } else if (allValues.status === 'inactive' && allValues.startDate) {
      setNotice(notices.inactive)
    } else {
      setNotice(null)
    }
  }

  return (
    <ResourceFormModal
      resourceName="campaign"
      readableResourceName="Campaign"
      resourceBaseUrl={`/administration/projects/${projectId}/new_campaigns`}
      resource={campaign}
      showSuccessMessages
      close={close}
      modalProps={{ width: 550 }}
      formProps={{ initialValues: { status: STATUSES.ACTIVE, type: TYPES.COMMON }, onValuesChange: handleValuesChange }}
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
            <Select>
              {_.map(STATUSES, (status: string) => (
                <Option key={status} value={status}>{_.capitalize(status)}</Option>))}
            </Select>
          </Form.Item>
          <Form.Item
            name="startDate"
            label={I18n.t('administration.dates.start')}
          >
            <DatePicker showTime format={format} disabledDate={disabledDate} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label={I18n.t('administration.dates.end')}
          >
            <DatePicker showTime format={format} disabledDate={disabledDate} />
          </Form.Item>
          <Form.Item
            name="practiceCampaign"
            valuePropName="checked"
            label={I18n.t('administration.campaigns.form.practice_campaign')}
          >
            {isEdit ? (
              <Tooltip title="This can be only enabled while creating campaign.">
                <Switch disabled={isEdit} />
              </Tooltip>
            ) : <Switch />}
          </Form.Item>
          <Space>
            {notice && <Alert message="Note" description={notice} type="warning" showIcon />}
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
