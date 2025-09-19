import React from 'react'
import {
  Modal, Button, Input, message,
  Form, DatePicker, Select, Checkbox,
} from 'antd'
import _ from 'lodash'
import { PropsFromRedux } from './connect'
import { STATUSES } from '~/constants/campaign'
import dayjs from '~/utils/dayjs'

const { I18n } = window

export interface OwnProps {
  close(): void
  campaign: {
    id: number
    name: string
  }
  projectId: number
}

export type Props = OwnProps & PropsFromRedux

const format = 'YYYY-MM-DD HH:mm'
// Can not select days before today
const disabledDate = current => current && current < dayjs().startOf('day')

const RemoveCampaignModal: React.FC<Props> = ({
  campaign, copy, projectId, close,
}) => {
  const [form] = Form.useForm()
  const handleOnConfirm = () => {
    const values = form.getFieldsValue()
    copy(campaign.id, projectId, { resource: values }).then(() => {
      message.info(I18n.t('frontend.campaign.actions.copy.success', { campaignName: campaign.name }))
    }).catch((error) => {
      message.error(error)
    })
    close()
  }

  return (
    <Modal
      width={650}
      title={I18n.t('administration.campaigns.copy')}
      open
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>
          {I18n.t('threesixty.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleOnConfirm}
        >
          {I18n.t('threesixty.save')}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={{ copyCampaignFactors: true }}>
        <Form.Item
          name="name"
          label={I18n.t('common.column.name')}
          initialValue={`Copy of ${campaign.name}`}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="status"
          label={I18n.t('administration.campaigns.form.status')}
          required
          initialValue={STATUSES.ACTIVE}
        >
          <Select>
            {_.map(STATUSES, (status: string) => (
              <Select.Option key={status} value={status}>{_.capitalize(status)}</Select.Option>))}
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
          name="copyCampaignFactors"
          valuePropName="checked"
        >
          <Checkbox defaultChecked>
            {I18n.t('administration.campaigns.form.copy_factors')}
          </Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RemoveCampaignModal
