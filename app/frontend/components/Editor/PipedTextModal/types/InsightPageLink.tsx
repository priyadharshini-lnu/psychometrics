import { useState } from 'react'
import {
  Button, Space, Form, Input,
} from 'antd'

const { I18n } = window

const InsightPageLink = ({ field: { getValue, name }, insert }) => {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const onOk = () => {
    const { text = 'Go to Insights' } = form.getFieldsValue()
    const baseValue = getValue(text)

    insert(baseValue)
    setOpen(false)
  }

  const content = (
    <Form
      onFinish={onOk}
      form={form}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16, style: { paddingLeft: '10px' } }}
    >
      <Space direction="vertical">
        <div className="flex flex-col">
          <Form.Item
            name="text"
            label={I18n.t('administration.piped_text_modal.text')}
          >
            <Input className="p-0" />
          </Form.Item>
          <Space>
            <Button htmlType="submit" type="primary">
              {I18n.t('common.actions.insert')}
            </Button>
            <Button onClick={() => setOpen(false)}>
              {I18n.t('common.actions.cancel')}
            </Button>
          </Space>
        </div>
      </Space>
    </Form>
  )

  return open ? content : (
    <Button type="link" onClick={() => setOpen(true)} style={{ padding: '0px' }}>
      {name}
    </Button>
  )
}

export default InsightPageLink
