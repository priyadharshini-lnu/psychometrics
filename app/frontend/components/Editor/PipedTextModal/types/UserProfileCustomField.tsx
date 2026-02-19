import { useState } from 'react'
import {
  Button, Space, Input, Form,
} from 'antd'
import styles from './Styles.less'

const { I18n } = window

const UserProfileCustomField = ({
  field: { getValue }, insert,
}) => {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const onOk = () => {
    form.validateFields().then(() => {
      const { fieldName } = form.getFieldsValue()
      if (fieldName.trim()) insert(getValue(fieldName))
    })
  }

  const content = (
    <Form
      form={form}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      initialValues={{ fieldName: '' }}
      className={styles.form}
    >
      <Space orientation="vertical">
        <Form.Item
          name="fieldName"
          label={I18n.t('custom_field.field_name')}
          rules={[{ required: true, transform: value => value.trim() }]}
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
      <div role="button" tabIndex={0} onClick={() => setOpen(true)}>
        <a>{I18n.t('administration.piped_text_modal.profile_custom_field')}</a>
      </div>

    )
  )
}

export default UserProfileCustomField
