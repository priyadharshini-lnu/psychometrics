import React, { useState } from 'react'
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
  onSuccess(): void
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

const CopyCampaignModal: React.FC<Props> = ({
  campaign, copy, projectId, close, onSuccess,
}) => {
  const [form] = Form.useForm()
  const [isLoading, setIsLoading] = useState(false)
  const handleOnConfirm = () => {
    const values = form.getFieldsValue()
    setIsLoading(true)
    copy(campaign.id, projectId, { resource: values }).then(() => {
      message.info(I18n.t('frontend.campaign.actions.copy.success', { campaignName: campaign.name }))
      onSuccess()
      close()
    }).catch((error) => {
      message.error(error)
    }).finally(() => {
      setIsLoading(false)
    })
  }

  return (
    <Modal
      width={650}
      title={I18n.t('shared.copy')}
      open
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>
          {I18n.t('shared.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleOnConfirm}
          loading={isLoading}
        >
          {I18n.t('shared.save')}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={{ copyCampaignFactors: true, copyCampaignAiArtifacts: true }}>
        <Form.Item
          name="name"
          label={I18n.t('shared.name')}
          initialValue={`Copy of ${campaign.name}`}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="status"
          label={I18n.t('shared.status')}
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
          label={I18n.t('admin.dates_start')}
        >
          <DatePicker showTime format={format} disabledDate={disabledDate} />
        </Form.Item>
        <Form.Item
          name="endDate"
          label={I18n.t('admin.dates_end')}
        >
          <DatePicker showTime format={format} disabledDate={disabledDate} />
        </Form.Item>
        <Form.Item
          name="copyCampaignFactors"
          valuePropName="checked"
        >
          <Checkbox defaultChecked>
            {I18n.t('admin.campaigns_form_copy_factors')}
          </Checkbox>
        </Form.Item>
        <Form.Item
          name="copyCampaignAiArtifacts"
          valuePropName="checked"
        >
          <Checkbox defaultChecked>
            {I18n.t('admin.copy_ai_artifacts')}
          </Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CopyCampaignModal
