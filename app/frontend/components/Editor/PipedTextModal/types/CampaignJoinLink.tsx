import { useState } from 'react'
import {
  Button, Space, Input, InputNumber, Form,
} from 'antd'

const { I18n } = window

const CampaignJoinLink = ({
  field: { getValue }, insert,
}) => {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const onOk = () => {
    form.validateFields().then(() => {
      const { campaign, expire, text } = form.getFieldsValue()
      if (campaign && expire && text.trim()) insert(getValue(campaign, expire, text.trim()))
    })
  }

  const content = (
    <Form
      form={form}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      initialValues={{ expire: 120, text: 'Join Campaign' }}
    >
      <Space direction="vertical">
        <Form.Item name="campaign" label={I18n.t('campaign_join_token.campaign_id')} rules={[{ required: true }]}>
          <InputNumber style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="expire" label={I18n.t('campaign_join_token.expire_in')} rules={[{ required: true }]}>
          <InputNumber style={{ width: 200 }} min={0} />
        </Form.Item>
        <Form.Item
          name="text"
          label={I18n.t('campaign_join_token.text')}
          rules={[{ required: true, max: 60, transform: value => value.trim() }]}
        >
          <Input style={{ width: 200 }} />
        </Form.Item>
        <Space>
          <Button onClick={onOk} type="primary">{I18n.t('common.actions.insert')}</Button>
          <Button onClick={() => setOpen(false)}>{I18n.t('common.actions.cancel')}</Button>
        </Space>
      </Space>
    </Form>
  )


  return (
    open ? content : (
      <Button type="link" onClick={() => setOpen(true)}>
        {I18n.t('administration.piped_text_modal.join_link')}
      </Button>
    )
  )
}

export default CampaignJoinLink
