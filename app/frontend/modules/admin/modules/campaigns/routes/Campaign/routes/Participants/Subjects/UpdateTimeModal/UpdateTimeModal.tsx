import React, { useState } from 'react'
import {
  Modal, Button, Form, InputNumber,
} from 'antd'
import { LoadingOutlined, CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { PropsFromRedux } from './connect'

const { I18n } = window

export interface OwnProps {
  close(): void
  campaignAssessmentId: number
  campaignId: number
  loading: boolean
}

export type Props = OwnProps & PropsFromRedux

const UpdateTimeModal: React.FC<Props> = ({
  close, campaignId, loading, updateAdditionalTime, campaignAssessmentId,
}) => {
  const [form] = Form.useForm()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_fields, setFields] = useState({})

  const handleUpdate = (params) => {
    updateAdditionalTime(campaignId, campaignAssessmentId, params.additionalTime)
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

export default UpdateTimeModal
