import { FC } from 'react'
import {
  Form, Input, Button, Modal,
} from 'antd'

const { I18n } = window

type Props = {
  showPrompt: boolean | undefined
  setShowPrompt: (value: boolean) => void
  handleAdd: (values: unknown) => void
  participant: Record<string, unknown> | null
}

export const NameModal: FC<Props> = ({
  showPrompt, setShowPrompt, handleAdd, participant,
}) => {
  const [form] = Form.useForm()

  const submit = (values) => {
    handleAdd(values)
    form.resetFields()
  }

  return (
    <Modal
      closable={false}
      mask={{ closable: false }}
      title={(
        <div className="help-modal-header">
          {I18n.t('threesixty.set_name_for_evaluator')}
          {' '}
          {participant && participant.email}
        </div>
      )}
      open={showPrompt}
      onCancel={() => setShowPrompt(false)}
      footer={null}
    >
      <Form form={form} name="control-hooks" onFinish={submit}>
        <Form.Item
          rules={[{ required: true, message: I18n.t('threesixty.first_name_error') }]}
          label={I18n.t('threesixty.first_name')}
          name="firstName"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
        >
          <Input
            required
            placeholder={I18n.t('threesixty.first_name')}
          />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: I18n.t('threesixty.last_name_error') }]}
          label={I18n.t('threesixty.last_name')}
          name="lastName"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
        >
          <Input
            required
            placeholder={I18n.t('threesixty.last_name')}
          />
        </Form.Item>
        <Form.Item wrapperCol={{ span: 12, offset: 10 }}>
          <Button type="primary" htmlType="submit">
            {I18n.t('threesixty.submit')}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
