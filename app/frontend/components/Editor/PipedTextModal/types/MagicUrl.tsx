import { useState } from 'react'
import {
  Button, Space, InputNumber, Form,
} from 'antd'

const { I18n } = window

const MagicUrl = ({ field: { getValue }, insert }) => {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const onOk = () => {
    form.validateFields().then(() => {
      const { campaignId, assessmentId } = form.getFieldsValue()

      let baseValue = getValue('', '')

      if (campaignId && assessmentId) {
        baseValue = getValue(campaignId, assessmentId)
      } else if (campaignId) {
        baseValue = getValue(campaignId, '')
      } else if (assessmentId) {
        baseValue = getValue('', assessmentId)
      }

      insert(baseValue)
      setOpen(false)
    })
  }

  const content = (
    <Form form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16, style: { paddingLeft: '10px' } }}>
      <Space direction="vertical">
        <Form.Item
          name="campaignId"
          label={I18n.t('administration.piped_text_modal.campaign_id')}

        >
          <InputNumber style={{ width: 200 }} />
        </Form.Item>
        <Form.Item
          name="assessmentId"
          label={I18n.t('administration.piped_text_modal.assessment_id')}

        >
          <InputNumber style={{ width: 200 }} />
        </Form.Item>
        <Space>
          <Button onClick={onOk} type="primary">
            {I18n.t('common.actions.insert')}
          </Button>
          <Button onClick={() => setOpen(false)}>
            {I18n.t('common.actions.cancel')}
          </Button>
        </Space>
      </Space>
    </Form>
  )

  return open ? content : (
    <Button type="link" onClick={() => setOpen(true)}>
      {I18n.t('administration.piped_text_modal.magic_url')}
    </Button>
  )
}

export default MagicUrl
