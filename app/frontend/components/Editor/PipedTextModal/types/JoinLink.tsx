import { useState } from 'react'
import {
  Button, Space, InputNumber, Form,
} from 'antd'

const { I18n } = window

const JoinLink = ({
  field: { getValue }, insert,
}) => {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const onOk = () => {
    form.validateFields().then(() => {
      const { campaign, expire } = form.getFieldsValue()
      if (campaign && expire) insert(getValue(campaign, expire))
    })
  }

  const content = (
    <Form
      form={form}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      initialValues={{ expire: 120 }}
    >
      <Space direction="vertical">
        <Form.Item name="campaign" label="Campaign ID" rules={[{ required: true }]}>
          <InputNumber style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="expire" label="Expire In (sec)" rules={[{ required: true }]}>
          <InputNumber style={{ width: 200 }} />
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

export default JoinLink
