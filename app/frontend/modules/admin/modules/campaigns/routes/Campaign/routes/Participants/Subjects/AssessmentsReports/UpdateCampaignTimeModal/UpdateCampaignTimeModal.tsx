import React, { useState } from 'react'
import {
  Modal, Button, Form, InputNumber, message,
} from 'antd'
import { LoadingOutlined, CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { PropsFromRedux } from './connect'

const { I18n } = window

export interface OwnProps {
  close(): void
  campaignId: number
  userId: number
  loading: boolean
}

export type Props = OwnProps & PropsFromRedux

const UpdateCampaignTimeModal: React.FC<Props> = ({
  close, campaignId, loading, extendTime, userId,
}) => {
  const [form] = Form.useForm()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_fields, setFields] = useState({})

  const handleUpdate = (params) => {
    extendTime(campaignId, userId, params.additionalTime).then(() => {
      message.success(
        I18n.t('admin.campaigns_extend_time_success_message', { minutes: params.additionalTime }),
      )
    })

    close()
  }
  return (
    <Modal
      width={650}
      title={I18n.t('campaign_assessment.modals.update_time.title')}
      open
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>{I18n.t('common.actions.cancel')}</Button>,
        <Button
          key="submit"
          disabled={!form.getFieldValue('additionalTime')}
          onClick={() => {
            form.submit()
          }}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('frontend.update')}
        </Button>,
      ]}
    >
      <Form
        name="basic"
        form={form}
        onFinish={handleUpdate}
        onFieldsChange={(_, allFields) => {
          setFields(allFields)
        }}
      >
        <Form.Item name="additionalTime" label={I18n.t('campaign_assessment.modals.update_time.additional_time')}>
          <InputNumber type="number" min={1} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UpdateCampaignTimeModal
